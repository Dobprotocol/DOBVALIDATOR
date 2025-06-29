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

// src/components/TrufaCertificateViewer.tsx
import React from "react";
var TrufaCertificateViewer = ({
  projectId,
  certificateId,
  mode = "full",
  theme = "light",
  className = ""
}) => {
  const [certificateData, setCertificateData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  React.useEffect(() => {
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
    return /* @__PURE__ */ React.createElement("div", { className: `trufa-certificate-loading ${theme} ${className}` }, "Loading certificate...");
  }
  if (error) {
    return /* @__PURE__ */ React.createElement("div", { className: `trufa-certificate-error ${theme} ${className}` }, error);
  }
  if (!certificateData) {
    return /* @__PURE__ */ React.createElement("div", { className: `trufa-certificate-not-found ${theme} ${className}` }, "Certificate not found");
  }
  return /* @__PURE__ */ React.createElement("div", { className: `trufa-certificate-viewer ${theme} ${mode} ${className}` }, /* @__PURE__ */ React.createElement("div", { className: "certificate-header" }, /* @__PURE__ */ React.createElement("h1", null, "TRUFA Certificate"), /* @__PURE__ */ React.createElement("div", { className: "certificate-id" }, "ID: ", certificateId)), /* @__PURE__ */ React.createElement("div", { className: "certificate-content" }, /* @__PURE__ */ React.createElement("div", { className: "project-info" }, /* @__PURE__ */ React.createElement("h2", null, certificateData.projectName), /* @__PURE__ */ React.createElement("p", null, "Operator: ", certificateData.operatorName)), /* @__PURE__ */ React.createElement("div", { className: "validation-details" }, /* @__PURE__ */ React.createElement("div", { className: "validation-date" }, "Validated: ", new Date(certificateData.validationDate).toLocaleDateString()), /* @__PURE__ */ React.createElement("div", { className: "expiry-date" }, "Expires: ", new Date(certificateData.expiryDate).toLocaleDateString()), /* @__PURE__ */ React.createElement("div", { className: "trufa-score" }, "TRUFA Score: ", certificateData.trufaScore)), mode === "full" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "device-specifications" }, /* @__PURE__ */ React.createElement("h3", null, "Device Specifications"), /* @__PURE__ */ React.createElement("p", null, "Type: ", certificateData.deviceSpecifications.type), /* @__PURE__ */ React.createElement("p", null, "Model: ", certificateData.deviceSpecifications.model), /* @__PURE__ */ React.createElement("p", null, "Manufacturer: ", certificateData.deviceSpecifications.manufacturer), /* @__PURE__ */ React.createElement("div", { className: "specs-grid" }, Object.entries(certificateData.deviceSpecifications.specifications).map(([key, value]) => /* @__PURE__ */ React.createElement("div", { key, className: "spec-item" }, /* @__PURE__ */ React.createElement("span", { className: "spec-label" }, key, ":"), /* @__PURE__ */ React.createElement("span", { className: "spec-value" }, value))))), /* @__PURE__ */ React.createElement("div", { className: "blockchain-info" }, /* @__PURE__ */ React.createElement("h3", null, "Blockchain Verification"), /* @__PURE__ */ React.createElement("p", null, "Transaction ID: ", certificateData.blockchainTxId), /* @__PURE__ */ React.createElement("a", { href: certificateData.verificationUrl, target: "_blank", rel: "noopener noreferrer" }, "Verify on Explorer")))));
};
export {
  TrufaCertificateViewer
};
