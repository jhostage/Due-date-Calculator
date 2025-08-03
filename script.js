function parseLocalDate(input) {
    const parts = input.split("-");
    // ✅ Parse as UTC to avoid timezone shifts
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  }
  
  function addDays(date, days) {
    // Always work in UTC
    const newDate = new Date(date.getTime());
    newDate.setUTCDate(newDate.getUTCDate() + days);
    return newDate;
  }
  
  function toggleInput() {
    const isIVF = document.querySelector('input[name="ivf"]:checked').value === "yes";
    document.getElementById("lmp-section").style.display = isIVF ? "none" : "block";
    document.getElementById("ivf-section").style.display = isIVF ? "block" : "none";
  }
  
  function toggleLMP() {
    const unknown = document.getElementById("unknownLMP").checked;
    document.getElementById("lmp-input").style.display = unknown ? "none" : "block";
  }
  
  function toggleUltrasound() {
    const noUltrasound = document.getElementById("noUltrasound")?.checked;
    if (noUltrasound !== undefined) {
      document.getElementById("ultrasound-section").style.display = noUltrasound ? "none" : "block";
    }
  }
  
  function calculateIVFDueDate() {
    const transferStr = document.getElementById("transfer").value;
    if (!transferStr) {
      alert("Please enter the embryo transfer date.");
      return;
    }
  
    const transferDate = parseLocalDate(transferStr);
    const transferType = document.getElementById("transfer-day").value;
    const daysToAdd = transferType === "5" ? 261 : 263;
  
    const dueDate = addDays(transferDate, daysToAdd);
    showResult(dueDate, null, null, transferDate);
  }
  
  function calculateEDD(lmpDate, ultrasoundDate, ultrasoundWeeks, ultrasoundDays) {
    const eddFromLMP = addDays(lmpDate, 280);
    let finalEDD = eddFromLMP;
  
    if (ultrasoundDate && ultrasoundWeeks != null && ultrasoundDays != null) {
      const ultrasoundGADays = ultrasoundWeeks * 7 + ultrasoundDays;
      const eddFromUS = addDays(ultrasoundDate, 280 - ultrasoundGADays);
  
      // ✅ Exact floating-point difference
      const diffDaysAbs = Math.abs((eddFromUS - eddFromLMP) / (1000 * 60 * 60 * 24));
  
      // ✅ Exact GA in days (no floor/round)
      const lmpGADaysAtUS = (ultrasoundDate - lmpDate) / (1000 * 60 * 60 * 24);
  
      // ✅ Determine threshold
      let thresholdDays;
      if (lmpGADaysAtUS <= 8 * 7 + 6) {
        thresholdDays = 5;
      } else if (lmpGADaysAtUS >= 9 * 7 && lmpGADaysAtUS <= 15 * 7 + 6) {
        thresholdDays = 7;
      } else if (lmpGADaysAtUS >= 16 * 7 && lmpGADaysAtUS <= 21 * 7 + 6) {
        thresholdDays = 10;
      } else if (lmpGADaysAtUS >= 22 * 7 && lmpGADaysAtUS <= 27 * 7 + 6) {
        thresholdDays = 14;
      } else {
        thresholdDays = 21;
      }
  
      // ✅ Redate ONLY if difference is STRICTLY greater than threshold
      if (diffDaysAbs > thresholdDays) {
        finalEDD = eddFromUS;
      }
    }
  
    return finalEDD;
  }
  
  function calculateNonIVFDueDate() {
    const unknownLMP = document.getElementById("unknownLMP").checked;
    const noUltrasound = document.getElementById("noUltrasound")?.checked || false;
  
    const ultraDateStr = document.getElementById("ultraDate").value;
    const ultraWeeks = document.getElementById("ultraWeeks").value;
    const ultraDays = document.getElementById("ultraDays").value;
  
    const lmpStr = document.getElementById("lmp").value;
  
    if (unknownLMP) {
      if (noUltrasound) {
        alert("Cannot calculate due date without LMP or ultrasound data.");
        return;
      }
      if (!ultraDateStr || ultraWeeks === "" || ultraDays === "") {
        alert("Enter ultrasound date and gestational age.");
        return;
      }
  
      const lmpEst = estimateLMPfromUltrasound(
        ultraDateStr,
        parseInt(ultraWeeks) + parseInt(ultraDays) / 7
      );
      const edd = addDays(lmpEst, 280);
      showResult(edd, null, null, lmpEst);
      return;
    }
  
    if (!lmpStr) {
      alert("Enter LMP date or check 'Last menstrual period unknown or cycles irregular'.");
      return;
    }
  
    const lmpDate = parseLocalDate(lmpStr);
    const finalEDD = calculateEDD(
      lmpDate,
      ultraDateStr ? parseLocalDate(ultraDateStr) : null,
      ultraWeeks ? parseInt(ultraWeeks) : null,
      ultraDays ? parseInt(ultraDays) : null
    );
  
    showResult(finalEDD, null, null, lmpDate);
  }
  
  function estimateLMPfromUltrasound(scanDateStr, gaWeeks) {
    const scanDate = parseLocalDate(scanDateStr);
    const daysSoFar = gaWeeks * 7;
    return addDays(scanDate, -daysSoFar);
  }
  
  function showResult(edd, diff, threshold, lmpDate) {
    const options = { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" };
    let text = `Estimated Due Date: ${edd.toLocaleDateString(undefined, options)}`;
  
    if (lmpDate) {
      const today = new Date();
      const daysPregnant = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24));
      if (daysPregnant >= 0 && daysPregnant <= 300) {
        const weeks = Math.floor(daysPregnant / 7);
        const days = daysPregnant % 7;
        let trimester = "1st";
        if (weeks >= 13 && weeks < 28) trimester = "2nd";
        if (weeks >= 28) trimester = "3rd";
  
        text += `\n(Current Gestational Age: ${weeks}w${days}d, ${trimester} trimester)`;
      }
    }
  
    document.getElementById("result").textContent = text;
  }
  
  window.onload = () => {
    toggleInput();
    toggleLMP();
    toggleUltrasound();
  };
  
  function handleCalculate() {
    const isIVF = document.querySelector('input[name="ivf"]:checked').value === "yes";
    if (isIVF) {
      calculateIVFDueDate();
    } else {
      calculateNonIVFDueDate();
    }
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  