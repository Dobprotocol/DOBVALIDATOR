"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.tsx
var index_exports = {};
__export(index_exports, {
  TrufaCertificateViewer: () => TrufaCertificateViewer
});
module.exports = __toCommonJS(index_exports);

// src/components/TrufaCertificateViewer.tsx
var import_react = __toESM(require("react"));
var TrufaCertificateViewer = ({
  projectId,
  certificateId,
  mode = "full",
  theme = "light",
  className = ""
}) => {
  const [certificateData, setCertificateData] = import_react.default.useState(null);
  const [loading, setLoading] = import_react.default.useState(true);
  const [error, setError] = import_react.default.useState(null);
  import_react.default.useEffect(() => {
    const fetchCertificateData = () => __async(null, null, function* () {
      try {
        setLoading(true);
        const response = yield fetch(`/api/certificates/${certificateId}`);
        const data = yield response.json();
        setCertificateData(data);
      } catch (err) {
        setError("Failed to load certificate data");
        console.error("Error fetching certificate:", err);
      } finally {
        setLoading(false);
      }
    });
    fetchCertificateData();
  }, [certificateId]);
  if (loading) {
    return /* @__PURE__ */ import_react.default.createElement("div", { className: `trufa-certificate-loading ${theme} ${className}` }, "Loading certificate...");
  }
  if (error) {
    return /* @__PURE__ */ import_react.default.createElement("div", { className: `trufa-certificate-error ${theme} ${className}` }, error);
  }
  if (!certificateData) {
    return /* @__PURE__ */ import_react.default.createElement("div", { className: `trufa-certificate-not-found ${theme} ${className}` }, "Certificate not found");
  }
  return /* @__PURE__ */ import_react.default.createElement("div", { className: `trufa-certificate-viewer ${theme} ${mode} ${className}` }, /* @__PURE__ */ import_react.default.createElement("div", { className: "certificate-header" }, /* @__PURE__ */ import_react.default.createElement("h1", null, "TRUFA Certificate"), /* @__PURE__ */ import_react.default.createElement("div", { className: "certificate-id" }, "ID: ", certificateId)), /* @__PURE__ */ import_react.default.createElement("div", { className: "certificate-content" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "project-info" }, /* @__PURE__ */ import_react.default.createElement("h2", null, certificateData.projectName), /* @__PURE__ */ import_react.default.createElement("p", null, "Operator: ", certificateData.operatorName)), /* @__PURE__ */ import_react.default.createElement("div", { className: "validation-details" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "validation-date" }, "Validated: ", new Date(certificateData.validationDate).toLocaleDateString()), /* @__PURE__ */ import_react.default.createElement("div", { className: "expiry-date" }, "Expires: ", new Date(certificateData.expiryDate).toLocaleDateString()), /* @__PURE__ */ import_react.default.createElement("div", { className: "trufa-score" }, "TRUFA Score: ", certificateData.trufaScore)), mode === "full" && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "device-specifications" }, /* @__PURE__ */ import_react.default.createElement("h3", null, "Device Specifications"), /* @__PURE__ */ import_react.default.createElement("p", null, "Type: ", certificateData.deviceSpecifications.type), /* @__PURE__ */ import_react.default.createElement("p", null, "Model: ", certificateData.deviceSpecifications.model), /* @__PURE__ */ import_react.default.createElement("p", null, "Manufacturer: ", certificateData.deviceSpecifications.manufacturer), /* @__PURE__ */ import_react.default.createElement("div", { className: "specs-grid" }, Object.entries(certificateData.deviceSpecifications.specifications).map(([key, value]) => /* @__PURE__ */ import_react.default.createElement("div", { key, className: "spec-item" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "spec-label" }, key, ":"), /* @__PURE__ */ import_react.default.createElement("span", { className: "spec-value" }, value))))), /* @__PURE__ */ import_react.default.createElement("div", { className: "blockchain-info" }, /* @__PURE__ */ import_react.default.createElement("h3", null, "Blockchain Verification"), /* @__PURE__ */ import_react.default.createElement("p", null, "Transaction ID: ", certificateData.blockchainTxId), /* @__PURE__ */ import_react.default.createElement("a", { href: certificateData.verificationUrl, target: "_blank", rel: "noopener noreferrer" }, "Verify on Explorer")))));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TrufaCertificateViewer
});
