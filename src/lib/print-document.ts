/**
 * Document Printing Utility for Official Registry Transcripts and Bursary Receipts.
 * Uses an isolated hidden iframe with desktop A4 viewport dimensions to eliminate
 * interference from modal backdrops, scroll containers, flex centering, and host page elements.
 */

export function printDocument(elementId: string, documentTitle: string = "Official University Document"): void {
  if (typeof window === "undefined") return;

  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    console.error(`[printDocument] Element with id "${elementId}" not found.`);
    window.print();
    return;
  }

  // Remove any pre-existing print iframe
  const existingFrame = document.getElementById("registry-print-frame");
  if (existingFrame && existingFrame.parentNode) {
    existingFrame.parentNode.removeChild(existingFrame);
  }

  // Create an off-screen iframe with realistic A4 desktop dimensions
  // This guarantees responsive classes (sm:, md:) match desktop print layout
  const iframe = document.createElement("iframe");
  iframe.id = "registry-print-frame";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.left = "-99999px";
  iframe.style.top = "-99999px";
  iframe.style.width = "820px";
  iframe.style.height = "1160px";
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";
  iframe.style.zIndex = "-99999";
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentWindow?.document;
  if (!frameDoc || !iframe.contentWindow) {
    console.error("[printDocument] Failed to access iframe document.");
    window.print();
    return;
  }

  // Clone all styles and stylesheets from the current document
  const styles: string[] = [];
  const styleNodes = document.querySelectorAll("link[rel='stylesheet'], style");
  styleNodes.forEach((node) => {
    styles.push(node.outerHTML);
  });

  // Deep clone the source element
  const cloned = sourceElement.cloneNode(true) as HTMLElement;

  // Remove modal wrapper/card artifacts
  cloned.classList.remove(
    "shadow-md",
    "shadow-sm",
    "shadow-lg",
    "shadow-2xl",
    "border",
    "border-slate-200",
    "rounded-2xl",
    "rounded-3xl",
    "overflow-hidden"
  );
  cloned.style.boxShadow = "none";
  cloned.style.border = "none";
  cloned.style.margin = "0";
  cloned.style.padding = "0";
  cloned.style.width = "100%";
  cloned.style.maxWidth = "100%";
  cloned.style.minHeight = "auto";
  cloned.style.borderRadius = "0";
  cloned.style.overflow = "visible";
  cloned.style.background = "#ffffff";
  cloned.style.color = "#0f172a";

  // Build the complete standalone HTML for the iframe
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${documentTitle}</title>
        ${styles.join("\n")}
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html {
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 13.5px;
            line-height: 1.45;
            -webkit-text-size-adjust: 100%;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            width: 100% !important;
            min-height: auto !important;
            overflow: visible !important;
          }
          #print-root {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          /* Prevent unwanted breaks in table rows and summary blocks */
          tr, .avoid-break, .grid, .border-t-2, .border-b-2 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Ensure SVGs and QR codes print crisply */
          svg {
            shape-rendering: geometricPrecision !important;
          }
        </style>
      </head>
      <body>
        <div id="print-root">
          ${cloned.outerHTML}
        </div>
      </body>
    </html>
  `;

  frameDoc.open();
  frameDoc.write(htmlContent);
  frameDoc.close();

  // Allow styles, fonts, and images to settle before triggering print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("[printDocument] Error triggering print inside iframe:", err);
      window.print();
    } finally {
      // Clean up the iframe after print dialog closes
      setTimeout(() => {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 3000);
    }
  }, 300);
}
