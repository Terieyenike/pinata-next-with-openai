import FileSaver from "file-saver";

export async function downloadImage(photo) {
  FileSaver.saveAs(photo, `image.jpg`);
}
