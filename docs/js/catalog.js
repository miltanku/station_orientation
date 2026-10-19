(function () {
  "use strict";

  function normalize(value) {
    return String(value || "").trim().toLocaleLowerCase();
  }

  document.querySelectorAll("[data-filter-input]").forEach(function (input) {
    var selector = input.getAttribute("data-filter-target");
    var target = selector ? document.querySelector(selector) : null;
    if (!target) return;
    var items = Array.from(target.querySelectorAll("[data-search-item]"));
    var count = input.getAttribute("aria-describedby");
    var countIds = count ? count.split(/\s+/) : [];
    var countNode = countIds.length ? document.getElementById(countIds[countIds.length - 1]) : null;
    var isCatalogSearch = input.hasAttribute("data-catalog-search");
    var searchLocale = input.getAttribute("data-search-locale") || "en";
    var temporaryNetworks = new Set(
      normalize(input.getAttribute("data-temporary-networks")).split(/\s+/).filter(Boolean)
    );

    function update() {
      var rawQuery = normalize(input.value);
      var query = rawQuery;
      var searchType = "permanent";
      if (isCatalogSearch) {
        var temporaryQuery = rawQuery.match(/^tmpst(?::|\s|$)\s*:?[\s]*(.*)$/);
        if (temporaryQuery) {
          searchType = "temporary";
          query = normalize(temporaryQuery[1]);
        }
        if (!rawQuery) {
          target.hidden = true;
          items.forEach(function (item) { item.hidden = true; });
          if (countNode) {
            countNode.textContent = searchLocale === "ja"
              ? "コードを入力して定常ネットワークを検索してください．"
              : "Enter a code to search permanent networks.";
          }
          return;
        }
        target.hidden = false;
      }
      var visible = 0;
      items.forEach(function (item) {
        var searchText = normalize(item.getAttribute("data-search"));
        var network = searchText.split(/\s+/)[0];
        var itemType = temporaryNetworks.has(network) ? "temporary" : "permanent";
        var typeMatches = !isCatalogSearch || itemType === searchType;
        var matches = typeMatches && (!query || searchText.indexOf(query) !== -1);
        item.hidden = !matches;
        if (matches) visible += 1;
      });
      if (countNode) {
        if (isCatalogSearch && searchLocale === "ja") {
          countNode.textContent = visible + "件の" + (searchType === "temporary" ? "臨時" : "定常") + "検索結果";
        } else {
          var typeLabel = isCatalogSearch ? searchType + " " : "";
          countNode.textContent = visible + " " + typeLabel + (visible === 1 ? "result" : "results");
        }
      }
    }

    input.addEventListener("input", update);
    update();
  });

  document.querySelectorAll("[data-sort-table]").forEach(function (button) {
    button.addEventListener("click", function () {
      var selector = button.getAttribute("data-sort-table");
      var body = selector ? document.querySelector(selector) : null;
      if (!body) return;
      Array.from(body.querySelectorAll("tr"))
        .sort(function (left, right) {
          var leftCell = left.querySelector("[data-sort-value]");
          var rightCell = right.querySelector("[data-sort-value]");
          return normalize(leftCell && leftCell.getAttribute("data-sort-value")).localeCompare(
            normalize(rightCell && rightCell.getAttribute("data-sort-value")),
            undefined,
            { numeric: true }
          );
        })
        .forEach(function (row) { body.appendChild(row); });
    });
  });

  document.querySelectorAll("[data-year-select]").forEach(function (select) {
    var scope = select.closest("section") || document;
    var openLink = scope.querySelector("[data-year-open]");
    var downloadLink = scope.querySelector("[data-year-download]");
    var preview = scope.querySelector("[data-year-preview]");
    var locale = select.getAttribute("data-locale") || "en";

    function updateYear() {
      var option = select.options[select.selectedIndex];
      if (!option) return;
      var pdfUrl = option.getAttribute("data-pdf-url");
      var downloadUrl = option.getAttribute("data-download-url") || pdfUrl;
      var year = option.value;
      if (openLink && pdfUrl) {
        openLink.href = pdfUrl;
        openLink.textContent = locale === "ja" ? year + "年PDFをプレビュー" : "Preview " + year + " PDF";
        openLink.setAttribute("data-pdf-label", year + (locale === "ja" ? "年 PDF" : " PDF"));
      }
      if (downloadLink && downloadUrl) {
        downloadLink.href = downloadUrl;
        downloadLink.textContent = locale === "ja" ? year + "年PDFをダウンロード" : "Download " + year + " PDF";
      }
      if (preview && pdfUrl) {
        preview.setAttribute("data", pdfUrl);
        preview.setAttribute("aria-label", year + " PDF preview");
      }
    }

    select.addEventListener("change", updateYear);
    updateYear();
  });

  var pdfDialog = document.querySelector("[data-pdf-dialog]");
  if (pdfDialog && typeof pdfDialog.showModal === "function") {
    var pdfFrame = pdfDialog.querySelector("[data-pdf-dialog-frame]");
    var pdfTitle = pdfDialog.querySelector("[data-pdf-dialog-title]");
    var pdfOpen = pdfDialog.querySelector("[data-pdf-dialog-open]");
    var pdfDownload = pdfDialog.querySelector("[data-pdf-dialog-download]");
    var pdfPrevious = pdfDialog.querySelector("[data-pdf-dialog-previous]");
    var pdfNext = pdfDialog.querySelector("[data-pdf-dialog-next]");
    var pdfPosition = pdfDialog.querySelector("[data-pdf-dialog-position]");
    var pdfSequences = {};
    var pdfSequence = [];
    var pdfSequenceIndex = -1;
    var pageLocale = document.documentElement && document.documentElement.lang === "ja" ? "ja" : "en";

    document.querySelectorAll("[data-pdf-station-sequence]").forEach(function (sequenceNode) {
      try {
        var variant = sequenceNode.getAttribute("data-pdf-station-sequence") || "corrected";
        var parsedSequence = JSON.parse(sequenceNode.textContent || "[]");
        if (Array.isArray(parsedSequence)) {
          pdfSequences[variant] = parsedSequence.filter(function (item) {
            return item && item.station && item.label && item.url;
          });
        }
      } catch (_error) {
        // Ignore a malformed sequence and keep other PDF variants available.
      }
    });

    function updatePdfNavigation() {
      var hasSequence = pdfSequence.length > 1 && pdfSequenceIndex >= 0;
      var previousItem = hasSequence && pdfSequenceIndex > 0
        ? pdfSequence[pdfSequenceIndex - 1]
        : null;
      var nextItem = hasSequence && pdfSequenceIndex < pdfSequence.length - 1
        ? pdfSequence[pdfSequenceIndex + 1]
        : null;
      var previousText = pageLocale === "ja" ? "前の観測点" : "Previous station";
      var nextText = pageLocale === "ja" ? "次の観測点" : "Next station";

      if (pdfPrevious) {
        pdfPrevious.hidden = !hasSequence;
        pdfPrevious.disabled = !previousItem;
        pdfPrevious.setAttribute(
          "aria-label",
          previousItem ? previousText + (pageLocale === "ja" ? "：" : ": ") + previousItem.station : previousText
        );
        pdfPrevious.title = pdfPrevious.getAttribute("aria-label");
      }
      if (pdfNext) {
        pdfNext.hidden = !hasSequence;
        pdfNext.disabled = !nextItem;
        pdfNext.setAttribute(
          "aria-label",
          nextItem ? nextText + (pageLocale === "ja" ? "：" : ": ") + nextItem.station : nextText
        );
        pdfNext.title = pdfNext.getAttribute("aria-label");
      }
      if (pdfPosition) {
        pdfPosition.hidden = !hasSequence;
        pdfPosition.textContent = hasSequence
          ? (pdfSequenceIndex + 1) + " / " + pdfSequence.length
          : "";
      }
    }

    function showPdf(pdfUrl, label, sequenceIndex) {
      if (!pdfUrl || !pdfFrame || !pdfOpen || !pdfDownload) return;
      pdfSequenceIndex = sequenceIndex;
      if (pdfTitle) pdfTitle.textContent = label;
      pdfFrame.setAttribute("src", pdfUrl);
      pdfFrame.setAttribute("title", label);
      pdfOpen.href = pdfUrl;
      pdfDownload.href = pdfUrl;
      updatePdfNavigation();
    }

    function showPdfAt(index) {
      var item = pdfSequence[index];
      if (!item) return;
      showPdf(item.url, item.label, index);
    }

    document.querySelectorAll("[data-pdf-preview-link]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var pdfUrl = link.href;
        if (!pdfUrl || !pdfFrame || !pdfOpen || !pdfDownload) return;
        event.preventDefault();
        var label = link.getAttribute("data-pdf-label") || link.textContent || "PDF";
        var station = link.getAttribute("data-pdf-station");
        var variant = link.getAttribute("data-pdf-variant") || "corrected";
        pdfSequence = pdfSequences[variant] || [];
        var sequenceIndex = station
          ? pdfSequence.findIndex(function (item) { return item.station === station; })
          : -1;
        showPdf(pdfUrl, label, sequenceIndex);
        pdfDialog.showModal();
      });
    });

    if (pdfPrevious) {
      pdfPrevious.addEventListener("click", function () {
        if (pdfSequenceIndex > 0) showPdfAt(pdfSequenceIndex - 1);
      });
    }

    if (pdfNext) {
      pdfNext.addEventListener("click", function () {
        if (pdfSequenceIndex >= 0 && pdfSequenceIndex < pdfSequence.length - 1) {
          showPdfAt(pdfSequenceIndex + 1);
        }
      });
    }

    pdfDialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft" && pdfSequenceIndex > 0) {
        event.preventDefault();
        showPdfAt(pdfSequenceIndex - 1);
      } else if (event.key === "ArrowRight" && pdfSequenceIndex >= 0 && pdfSequenceIndex < pdfSequence.length - 1) {
        event.preventDefault();
        showPdfAt(pdfSequenceIndex + 1);
      }
    });

    pdfDialog.querySelectorAll("[data-pdf-dialog-close]").forEach(function (button) {
      button.addEventListener("click", function () { pdfDialog.close(); });
    });

    pdfDialog.addEventListener("click", function (event) {
      if (event.target === pdfDialog) pdfDialog.close();
    });

    pdfDialog.addEventListener("close", function () {
      if (pdfFrame) pdfFrame.removeAttribute("src");
      pdfSequenceIndex = -1;
      updatePdfNavigation();
    });
  }
})();
