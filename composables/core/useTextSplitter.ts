import { ref } from "vue";
import Swal from "sweetalert2";
import mammoth from "mammoth";
import { PDFDocument } from "pdf-lib";
import wrap from "wrap-ansi";

export const useTextSplitter = () => {
  const slides = ref<{ text: string; color?: string }[]>([]);
  const editingIndex = ref<number | null>(null);
  const previousEditingIndex = ref<number | null>(null);
  const editingText = ref<string>("");

  function splitTextIntoSlides(text) {
    let modified = text
      .replace("\n", "")
      .replace("\t", "")
      .replace(/\s+/g, " ");
    console.log(modified, "modified");
    const chunkSize = 320;
    const whitespaceChars = [" ", "\n", "\t"];
    modified = String(modified);
    const textLength = modified.length;
    let start = 0;
    let end = chunkSize;
    const chunks = [];
    while (end < textLength + 1) {
      const charAtCutPosition = textLength[end];
      if (whitespaceChars.includes(charAtCutPosition)) {
        chunks.push(modified.slice(start, end));
      } else {
        end = String(modified).lastIndexOf(" ", end);
        chunks.push(modified.slice(start, end));
      }
      start = end;
      // end += chunkSize;
      if (end + chunkSize > textLength) {
        end += textLength - end;
        if (whitespaceChars.includes(charAtCutPosition)) {
          chunks.push(modified.slice(start, end));
        } else {
          end = String(modified).lastIndexOf(" ", end);
          chunks.push(modified.slice(start, end));
        }
        break;
      } else {
        end += chunkSize;
      }
    }
    console.log(chunks);
    // return chunks;

    const newSlides = chunks.map((chunk) => ({ text: chunk }));
    slides.value = [...slides.value, ...newSlides].slice(0, 30);
    if (slides.value.length >= 30) {
      useNuxtApp().$toast.warn("Slides Must not exceed 30", {
        autoClose: 5000,
        dangerouslyHTMLString: true,
      });
    }
    return newSlides;
  }

  const removeSlide = (index: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete Slide.",
      cancelButtonText: "Nah, Just kidding",
    }).then((result) => {
      if (result.value) {
        slides.value.splice(index, 1);
      } else {
        Swal.fire("Cancelled", "Action was cancelled", "info");
      }
    });
  };

  const startEditing = (index: number) => {
    previousEditingIndex.value =
      editingIndex.value !== null ? editingIndex.value : null;
    editingIndex.value = index;
    editingText.value = slides.value[index].text;
  };

  const saveEditing = () => {
    if (editingIndex.value !== null) {
      slides.value[editingIndex.value].text = editingText.value;
      editingIndex.value = null;
      editingText.value = "";
    }
  };

  const cancelEditing = () => {
    editingIndex.value = null;
    editingText.value = "";
  };

  const readDocxFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const readPdfFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    let text = "";

    for (const page of pages) {
      const textContent = await page.getTextContent();
      text += textContent.items.map((item) => item.str).join(" ") + "\n";
    }

    return text;
  };

  const uploadFile = async (file: File) => {
    let text = "";
    if (file.type === "application/pdf") {
      text = await readPdfFile(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await readDocxFile(file);
    } else if (file.type === "text/plain") {
      text = await file.text();
    } else {
      Swal.fire(
        "Unsupported file type",
        "Please upload a DOCX, PDF, or TXT file.",
        "error"
      );
      return;
    }
    splitTextIntoSlides(text);
  };

  const clearSlides = async () => {
    if (Array.isArray(slides.value)) {
      slides.value.length = 0;
      slides.value = [];
    }
  };

  return {
    slides,
    splitTextIntoSlides,
    removeSlide,
    editingIndex,
    previousEditingIndex,
    editingText,
    startEditing,
    saveEditing,
    cancelEditing,
    uploadFile,
    clearSlides
  };
};
