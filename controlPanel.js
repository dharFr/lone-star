const controlPanel = {
  options: {},
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
      // console.log('>>', key, option, '-->', values[i])
      option.value = parseInt(values[i], 10) || values[i];
    });
  },

  createInputRange: function _createInputRange(key, parameter) {
    const label = document.createElement("label");
    label.setAttribute("for", `${key}Range`);

    const text = document.createTextNode(key);

    const inputRange = document.createElement("input");
    inputRange.type = "range";
    inputRange.min = parameter.min;
    inputRange.max = parameter.max;
    inputRange.step = parameter.step;
    inputRange.value = parameter.value;
    inputRange.name = `${key}Range`;

    const output = document.createElement("output");
    output.name = key;
    output.textContent = parameter.value;

    label.appendChild(text);
    label.appendChild(document.createElement("br"));
    label.appendChild(inputRange);
    label.appendChild(output);

    // Listen to changes
    inputRange.addEventListener("input", (e) => {
      parameter.value = inputRange.value;
      output.textContent = inputRange.value;
      this.onChange(key, parameter);
    });

    this.rootNode.appendChild(label);
    this.rootNode.appendChild(document.createElement("hr"));
  },

  createSelect: function (key, parameter) {
    const label = document.createElement("label");
    label.setAttribute("for", `${key}Select`);

    const text = document.createTextNode(key);

    const select = document.createElement("select");
    select.name = `${key}Select`;

    parameter.options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.text = opt;
      option.selected = parameter.value === opt;
      select.appendChild(option);
    });

    label.appendChild(text);
    label.appendChild(select);

    // Listen to changes
    select.addEventListener("change", (e) => {
      parameter.value = select.selectedIndex;
      this.onChange(key, parameter);
    });

    this.rootNode.appendChild(label);
    this.rootNode.appendChild(document.createElement("hr"));
  },

  createInputColor: function (key, parameter) {
    const label = document.createElement("label");
    label.setAttribute("for", `${key}Select`);

    const text = document.createTextNode(key);

    const inputColor = document.createElement("input");
    inputColor.type = "color";
    inputColor.value = parameter.value;
    inputColor.name = `${key}Range`;

    label.appendChild(text);
    label.appendChild(inputColor);

    inputColor.addEventListener("change", (e) => {
      parameter.value = inputColor.value;
      this.onChange(key, parameter);
    });

    this.rootNode.appendChild(label);
    this.rootNode.appendChild(document.createElement("hr"));
  },

  createShareLink: function () {
    const label = document.createElement("label");
    const text = document.createTextNode("Share: ");

    const a = document.createElement("a");
    a.href = "#";
    a.textContent = this.serialize();
    label.appendChild(text);
    label.appendChild(document.createElement("br"));
    label.appendChild(a);

    this.rootNode.appendChild(label);
    this.rootNode.appendChild(document.createElement("hr"));

    return a;
  },

  createControlPanel: function _createControlPanel(
    rootNode,
    parameters,
    onChange
  ) {
    console.log("createControlPanel:", location.hash);
    this.rootNode = rootNode;
    this.options = parameters;
    // this.onChange = onChange
    this.onChange = (key, param) => {
      const serial = this.serialize();
      this.shareLink.textContent = serial;
      location.hash = encodeURIComponent(serial);
      this.shareLink.href = location.href;
      onChange(key, param);
    };

    // Read/Write from the hash doesn't work on p5.js preview env
    // But does work when page is self-hosted
    if (location.hash) {
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

    this.shareLink = this.createShareLink();
  },
};

p5.prototype.createControlPanel = function (parameters, onChange) {
  // <aside id='controlPanel' class="control-panel">
  //   <details>
  //     <summary>Parameters</summary>
  //   </details>
  // </aside>
  const aside = document.createElement("aside");
  aside.classList.add("control-panel");

  const details = document.createElement("details");
  details.open = true;
  const summary = document.createElement("summary");
  summary.textContent = "Parameters";
  details.appendChild(summary);
  aside.appendChild(details);
  document.body.appendChild(aside);

  controlPanel.createControlPanel(details, parameters, onChange);
};
