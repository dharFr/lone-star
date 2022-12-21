const controlPanel = {
  options: {},
  links: {},
  shareLink: null,

  serialize: function () {
    const serial = Object.values(this.options)
      .map(({ value }) => value)
      .join("-");
    return serial;
  },

  deserialize: function (serial) {
    const values = serial.split("-");
    Object.entries(this.options).forEach(([key, option], i) => {
      console.log(`--> ${key}: ${values[i]}`);
      option.value = parseInt(values[i], 10) || values[i];
    });
  },

  createInputRange: function _createInputRange(key, parameter) {
    const markup = `<label for="${key}Range">
      ${key}<br>
      <input type="range" 
        min="${parameter.min}" 
        max="${parameter.max}" 
        step="${parameter.step}" 
        value="${parameter.value}"
        name="${key}Range"/>
      <output name="${key}">${parameter.value}</output>
    </label>
    <hr>`;
    this.rootNode.insertAdjacentHTML("beforeend", markup);

    const inputRange = this.rootNode.querySelector(`input[name=${key}Range]`);
    const output = this.rootNode.querySelector(`output[name=${key}]`);

    // Listen to changes
    inputRange.addEventListener("input", (e) => {
      parameter.value = inputRange.value;
      output.textContent = inputRange.value;
      this.onChange(key, parameter);
    });
  },

  createSelect: function (key, parameter) {
    const markup = `<label for="${key}Select">
      ${key} 
      <select name="${key}Select">
        ${parameter.options
          .map(
            (opt, i) =>
              `<option value="${opt}" ${
                parameter.value === i ? "selected" : ""
              }>${opt}</option>`
          )
          .join("")}
      </select>
    </label>
    <hr>`;
    this.rootNode.insertAdjacentHTML("beforeend", markup);

    const select = this.rootNode.querySelector(`select[name=${key}Select]`);

    // Listen to changes
    select.addEventListener("change", (e) => {
      parameter.value = select.selectedIndex;
      this.onChange(key, parameter);
    });
  },

  createInputColor: function (key, parameter) {
    const markup = `<label for="${key}Select">
      ${key}
      <input type="color" name="${key}Color" value="${parameter.value}">
    </label>
    <hr>`;
    this.rootNode.insertAdjacentHTML("beforeend", markup);

    const inputColor = this.rootNode.querySelector(`input[name=${key}Color]`);

    inputColor.addEventListener("change", (e) => {
      parameter.value = inputColor.value;
      this.onChange(key, parameter);
    });
  },

  createCopyLinkButton: function () {
    const markup = `<label>
      Save link  
      <input type="button" name="copy-link-btn" value="Copy Link" >
      <output name="copy-link-btn-output"></output>
    </label>
    <hr>`;
    this.rootNode.insertAdjacentHTML("beforeend", markup);

    const inputCopyLinkBtn = this.rootNode.querySelector(
      "input[name=copy-link-btn]"
    );
    const outputCopyLinkBtn = this.rootNode.querySelector(
      "output[name=copy-link-btn-output]"
    );

    inputCopyLinkBtn.addEventListener("click", (e) => {
      const serial = this.serialize();
      location.hash = encodeURIComponent(serial);

      navigator.clipboard.writeText(location.href).then(
        () => {
          outputCopyLinkBtn.textContent = " (copied ✓)";
          setTimeout(() => {
            outputCopyLinkBtn.textContent = "";
          }, 2000);
        },
        (err) => console.error("copy link failed.", err)
      );
    });
  },

  createSavePictureButton: function () {
    const markup = `<label>
      Save Picture  
      <input type="button" name="save-pict-btn" value="Save Picture" >
      <output name="save-pict-btn-output"></output>
    </label>
    <hr>`;
    this.rootNode.insertAdjacentHTML("beforeend", markup);

    const inputSavePictureBtn = this.rootNode.querySelector(
      "input[name=save-pict-btn]"
    );

    inputSavePictureBtn.addEventListener("click", (e) => {
      const serial = this.serialize();
      location.hash = encodeURIComponent(serial);

      // Watermark
      this.watermark(serial, location.href);

      // Save picture
      saveCanvas(`lone-star-${serial}`, "jpg");

      loop();
    });
  },

  createLinks: function () {
    const markup = `<ul class="links">
      ${Object.entries(this.links)
        .map(
          ([label, { name, link }]) =>
            `<li>
          <label>${label}:
            <a title="${label}" href="${link}">${name}</a>
          </label>
        </li>`
        )
        .join("")}
    </ul>
    <hr>`;
    this.rootNode.insertAdjacentHTML("beforeend", markup);
  },

  createControlPanel: function _createControlPanel(
    rootNode,
    parameters,
    links,
    onChange,
    watermarkFunc
  ) {
    this.rootNode = rootNode;
    this.options = parameters;
    this.links = links;
    this.onChange = onChange;
    this.watermark = watermarkFunc;

    // Read/Write from the hash doesn't work on p5.js preview env
    // But does work when page is self-hosted
    if (location.hash) {
      console.log("createControlPanel:", location.hash);
      this.deserialize(decodeURIComponent(location.hash.slice(1)));
    }
    // this.deserialize(decodeURIComponent('50-154-8-2-%23b51a00'))

    for (let key in this.options) {
      const parameter = this.options[key];

      if (typeof parameter === "object") {
        // Arrays are rendered as <select>
        if (parameter.options && Array.isArray(parameter.options)) {
          this.createSelect(key, parameter);
        }
        // Numbers are rendered as input[type='range']
        else if (typeof parameter.value == "number") {
          this.createInputRange(key, parameter);
        }
        // Strings are rendered as input[type='color']
        else if (typeof parameter.value === "string") {
          this.createInputColor(key, parameter);
        } else {
          console.warn(
            "createControlPanel: unknown parameter",
            key,
            parameter,
            typeof parameter
          );
        }
      } else {
        console.warn(
          "createControlPanel: unknown parameter",
          key,
          parameter,
          typeof parameter
        );
      }
    }
    this.createCopyLinkButton();
    this.createSavePictureButton();
    this.createLinks();
  },
};

p5.prototype.createControlPanel = function (
  parameters,
  links,
  onChange,
  watermarkFunc
) {
  const markup = `<aside id='controlPanel' class="control-panel">
    <details open>
      <summary>Parameters</summary>
      <section>
      </section>
    </details>
  </aside>`;

  document.body.insertAdjacentHTML("beforeend", markup);
  const section = document.body.querySelector("#controlPanel details section");

  controlPanel.createControlPanel(
    section,
    parameters,
    links,
    onChange,
    watermarkFunc
  );
};
