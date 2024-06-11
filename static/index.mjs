async function predictNextWord() {
    const typingBox = document.getElementById('typingBox');
    const dropdownBox = document.getElementById('dropdownBox');
    const text = typingBox.value;
    const caretPos = typingBox.selectionStart;
    console.log(text)
  
    if (text.length > 0) {
      const caretCoordinates = getCaretCoordinates(typingBox);
      console.log(caretCoordinates)
      console.log(`Sending word: ${text}`);  // Debug print
  
      const response = await fetch('/predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text.split(".").slice(-1)[0] })
      });
  
      if (response.ok) {
        const data = await response.json(); // Get the predicted words as a list
        console.log(`Received predictions: ${data}`);  // Debug print
  
        // Position the dropdown beside the caret
        dropdownBox.innerHTML = ''; // Clear previous suggestions
        dropdownBox.style.display = 'block';
        dropdownBox.style.top = `${caretCoordinates.top}px`; // Adjust the top position to be below the caret
        dropdownBox.style.left = `${caretCoordinates.left}px`;
  
        // Populate dropdown with predictions
        data.forEach(word => {
          const item = document.createElement('div');
          item.className = 'dropdown-item';
          item.textContent = word;
          item.onclick = () => {
            typingBox.value = text + ' ' + word;
            dropdownBox.innerHTML = '';
            dropdownBox.style.display = 'none';
          };
          dropdownBox.appendChild(item);
        });
      } else {
        console.error('Failed to fetch prediction');
        dropdownBox.innerHTML = '';
        dropdownBox.style.display = 'none';
      }
    } else {
      dropdownBox.innerHTML = '';
      dropdownBox.style.display = 'none';
    }
  }
  
  function getCaretCoordinates(textarea) {
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
    const rect = textarea.getBoundingClientRect();
    const x = rect.left + getOffsetWithinLine(textarea, cursorPosition) - textarea.scrollLeft;
    const y = rect.top + (textBeforeCursor.split("\n").length * lineHeight) - textarea.scrollTop;
    return { "left":x-25, "top":y-80 };
  }
  
  function getOffsetWithinLine(textarea, cursorPosition) {
    const textBeforeCursorOnLine = textarea.value.substring(textarea.value.lastIndexOf("\n", cursorPosition) + 1, cursorPosition);
    const charWidth = getTextWidth(textarea, ' ');
    return textBeforeCursorOnLine.length * charWidth;
  }
  
  function getTextWidth(textarea, text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = window.getComputedStyle(textarea).font;
    return context.measureText(text).width;
  }