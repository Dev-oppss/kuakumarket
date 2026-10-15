/**
 * Génère le PDF du reçu (A4, une page PDF par feuille .recu-page) directement
 * dans le navigateur. html2canvas et jsPDF sont chargés à la demande pour ne
 * pas alourdir le reste du site.
 */
export async function downloadReceiptPdf(displayId: number | string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")])

  if (document.fonts?.ready) await document.fonts.ready
  const sheets = Array.from(document.querySelectorAll<HTMLElement>(".recu-page"))
  if (sheets.length === 0) throw new Error("Reçu introuvable")

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
  for (let i = 0; i < sheets.length; i++) {
    const canvas = await html2canvas(sheets[i], {
      scale: 2.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      // On capture à taille réelle : on neutralise la mise à l'échelle d'affichage.
      onclone: (doc) => {
        const scaler = doc.getElementById("recu-scaler")
        if (scaler) scaler.style.transform = "none"
        const box = doc.querySelector<HTMLElement>(".recu-viewport")
        if (box) box.style.height = "auto"
      },
    })
    if (i > 0) pdf.addPage()
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297)
  }
  pdf.save(`Recu-KuakuMarket-${displayId}.pdf`)
}
