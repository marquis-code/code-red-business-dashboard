import Swal from "sweetalert2";
export const useFileUploader = () => {
  const textChunks = ref<{ text: string }[]>([]);
  const editingIndex = ref<number | null>(null);
  const editingText = ref<string>("");
  const isLoading = ref<boolean>(false);

  const handleFileUpload = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadstart = () => {
        isLoading.value = true;
      };

      reader.onload = (event) => {
        const text = event.target?.result as string;
        processText(text);
        isLoading.value = false;
        resolve();
      };

      reader.onerror = () => {
        isLoading.value = false;
        reject(new Error("File reading failed"));
      };

      reader.readAsText(file);
    });
  };

  // const processText = (text: string) => {
  //   const chunks: { text: string }[] = [];
  //   for (let i = 0; i < text.length; i += 320) {
  //     if (chunks.length >= 25) break; // Stop processing after 25 chunks
  //     chunks.push({ text: text.slice(i, i + 320) });
  //   }
  //   textChunks.value = chunks;
  // };

  const processText = (text: string) => {
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
    textChunks.value = [...textChunks.value, ...newSlides].slice(0, 30);
    return newSlides;
  }

  const removeChunk = (index: number) => {
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
        textChunks.value.splice(index, 1);
      } else {
        Swal.fire("Cancelled", "Action was cancelled", "info");
      }
    });
  };

  const startEditing = (index: number) => {
    editingIndex.value = index;
    editingText.value = textChunks.value[index].text;
  };

  const saveEditing = () => {
    if (editingIndex.value !== null) {
      textChunks.value[editingIndex.value].text = editingText.value;
      editingIndex.value = null;
      editingText.value = "";
    }
  };

  const cancelEditing = () => {
    editingIndex.value = null;
    editingText.value = "";
  };

  return {
    textChunks,
    handleFileUpload,
    removeChunk,
    editingIndex,
    editingText,
    startEditing,
    saveEditing,
    cancelEditing,
    isLoading,
  };
};

