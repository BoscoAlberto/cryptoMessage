function encrypt(plaintext, password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const passwordData = encoder.encode(password);
  
    return window.crypto.subtle.digest("SHA-256", passwordData)
      .then((key) =>
        window.crypto.subtle.importKey(
          "raw",
          key,
          "AES-CBC",
          false,
          ["encrypt"]
        )
      )
      .then((cryptoKey) =>
        window.crypto.subtle.encrypt(
          { name: "AES-CBC", iv: new Uint8Array(16) },
          cryptoKey,
          data
        )
      )
      .then((encrypted) => {
        const encoder = new TextEncoder();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
        return base64;
      });
  }
  
  function decrypt(ciphertext, password) {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
  
    return window.crypto.subtle.digest("SHA-256", passwordData)
      .then((key) =>
        window.crypto.subtle.importKey(
          "raw",
          key,
          "AES-CBC",
          false,
          ["decrypt"]
        )
      )
      .then((cryptoKey) => {
        const encryptedBytes = Uint8Array.from(atob(ciphertext), (c) =>
          c.charCodeAt(0)
        );
  
        return window.crypto.subtle.decrypt(
          { name: "AES-CBC", iv: new Uint8Array(16) },
          cryptoKey,
          encryptedBytes
        );
      })
      .then((decrypted) => {
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
      });
  }
  
  document.getElementById("addForm").addEventListener("submit", (event) => {
    event.preventDefault();
  
    const nameInput = document.getElementById("nameInput");
    const passwordInput = document.getElementById("passwordInput");
  
    const name = nameInput.value.trim();
    const password = passwordInput.value.trim();
  
    if (name === "" || password === "") {
      return;
    }
  
    encrypt(name, password)
      .then((encryptedName) => {
        const li = document.createElement("li");
        li.textContent = encryptedName;
        document.getElementById("phonebook").appendChild(li);
  
        nameInput.value = "";
        passwordInput.value = "";
      })
      .catch((error) => {
        console.error("Errore durante la cifratura del nome:", error);
      });
  });
  
  document.getElementById("decryptForm").addEventListener("submit", (event) => {
    event.preventDefault();
  
    const decryptPasswordInput = document.getElementById("decryptPasswordInput");
    const decryptPassword = decryptPasswordInput.value.trim();
  
    const encryptedNames = document.querySelectorAll("#phonebook li");
    encryptedNames.forEach((encryptedName) => {
      decrypt(encryptedName.textContent, decryptPassword)
        .then((decryptedName) => {
          encryptedName.textContent = decryptedName;
        })
        .catch((error) => {
          console.error("Errore durante la decifratura del nome:", error);
        });
    });
  
    decryptPasswordInput.value = "";
  });
  
  document.getElementById("clearButton").addEventListener("click", () => {
    const phonebook = document.getElementById("phonebook");
    phonebook.innerHTML = "";
  });