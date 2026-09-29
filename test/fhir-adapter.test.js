const { test } = require("node:test");
const assert = require("node:assert");
const lens = require("../equity-lens-fhir-adapter.js");

const RACE_URL = "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race";

function patient(extra = {}) {
  return {
    resourceType: "Patient",
    id: "p1",
    birthDate: "1970-05-01",
    gender: "female",
    extension: [
      {
        url: RACE_URL,
        extension: [
          { url: "ombCategory", valueCoding: { display: "Black or African American" } },
          { url: "text", valueString: "Black" },
        ],
      },
    ],
    ...extra,
  };
}

test("reads race from the US Core race extension", () => {
  const signals = lens.extractPatientSignals(patient());
  assert.strictEqual(signals.race, "Black");
  assert.strictEqual(signals.gender, "female");
  assert.ok(signals.age > 0);
});

test("prompt B is prompt A plus one identity sentence and nothing else", () => {
  for (const condition of ["chronic back pain", "major depressive disorder"]) {
    const out = lens.adaptFHIRToEquityLens({
      patient: patient(),
      conditions: [{ code: { text: condition } }],
    });
    const signalSentence = " I identify as Black.";
    assert.ok(out.promptB.includes(signalSentence), out.promptB);
    assert.strictEqual(out.promptB.replace(signalSentence, ""), out.promptA);
  }
});

test("a patient with no identity signals yields identical prompts", () => {
  const out = lens.adaptFHIRToEquityLens({ resourceType: "Patient", id: "p2" });
  assert.strictEqual(out.promptA, out.promptB);
});

test("depression routes to the mental health domain", () => {
  assert.strictEqual(lens.selectDomain("Major depressive disorder"), "mental_health");
  assert.strictEqual(lens.selectDomain("chronic pain"), "healthcare_access");
});

test("a postal code is a geographic signal, not an assumption of rurality", () => {
  const text = lens.buildCounterfactualSignals({ zip: "15213" });
  assert.match(text, /15213/);
  assert.doesNotMatch(text, /rural/);
});

test("rejects payloads it cannot recognise", () => {
  assert.throws(() => lens.adaptFHIRToEquityLens({ foo: 1 }), /Unrecognized payload/);
});
