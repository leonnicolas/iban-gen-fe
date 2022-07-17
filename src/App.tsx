import React, { useState, useCallback, useEffect } from "react";
import "./App.css";
import { Service, ApiError, OpenAPI, BIC } from "./generated";
import {
  InputGroup,
  FormControl,
  Button,
  Container,
  Row,
  Col,
  Alert,
} from "react-bootstrap";

import { IBANGeneration } from "./generated/models/IBANGeneration";

OpenAPI.BASE = "https://ibans.es.klump.solutions";

const { random, bics } = Service;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIBANGeneration(value: unknown): value is IBANGeneration {
  return (
    isObject(value) &&
    typeof value["iban"] === "string" &&
    typeof value["bankcode"] === "string"
  );
}

function isArrayBICs(value: unknown): value is Array<BIC> {
  return (
    isObject(value) &&
    Array.isArray(value) &&
    (value.length === 0 ||
      (typeof value[0]["bic"] === "string" &&
        typeof value[0]["countryCode"] === "string"))
  );
}

function IBAN(props: {
  error: string;
  display: boolean;
  gen: IBANGeneration | undefined;
  setError: React.Dispatch<React.SetStateAction<string>>;
}) {
  if (props.error !== "") {
    return (
      <Alert
        className="mt-3"
        variant="danger"
        onClose={() => props.setError("")}
        dismissible
      >
        {" "}
        {props.error}{" "}
      </Alert>
    );
  }
  let classes = "iban mt-4";
  if (props.display || props.gen === undefined) {
    classes += " none";
  }
  return (
    <div className={classes}>
      <Container>
        <Row>
          <Col>
            <span className="output-name">IBAN:</span>
          </Col>
          <Col>{props.gen?.iban}</Col>
        </Row>
        <Row>
          <Col>
            <span className="output-name">BIC:</span>
          </Col>
          <Col>{props.gen?.bic}</Col>
        </Row>
        <Row>
          <Col>
            <span className="output-name">Bankleitzahl:</span>
          </Col>
          <Col>{props.gen?.bankcode}</Col>
        </Row>
      </Container>
    </div>
  );
}

function getRandom(
  b: string,
  bc?: string,
  cc?: string
): Promise<IBANGeneration> {
  return random(b, bc, cc).then(
    (iban: unknown) => {
      if (isIBANGeneration(iban)) {
        return iban;
      } else {
        throw iban;
      }
    },
    (err: ApiError) => {
      throw err.body.error;
    }
  );
}

function App() {
  const [allBICs, setAllBICs] = useState<Array<BIC>>([]);
  const [filteredBICs, setFilteredBICs] = useState<Array<BIC>>([]);
  const [iban, setIBAN] = useState<IBANGeneration>();
  const [input, setInput] = useState("");
  const [display, setDisplay] = useState(false);
  const [error, setError] = useState("");

  const getAllBICs = () => {
    bics("DE")
      .then(
        (v) => {
          if (isArrayBICs(v)) {
            setAllBICs(v);
          }
        },
        (_) => setAllBICs([])
      )
      .catch((err) => setIBAN(err));
  };

  useEffect(() => {
    getAllBICs();
  }, []);

  const handleInput = useCallback(
    (v: string) => {
      setDisplay(true);
      setError("");
      setInput(v);
      setFilteredBICs(
        allBICs.filter((bic: BIC) => {
          return (
            bic.bic.toLowerCase().includes(v.toLowerCase()) ||
            bic.bank.toLowerCase().includes(v.toLowerCase())
          );
        })
      );
    },
    [allBICs]
  );

  const handleClick = useCallback(() => {
    setDisplay(false);
    let bc = input;
    let cc = "";
    let b = "";

    if (filteredBICs.length > 0) {
      b = filteredBICs[0].bic;
      cc = filteredBICs[0].countryCode;
      bc = "";
      setInput(completeInput(input, filteredBICs[0]));
      setFilteredBICs([]);
    } else {
      const bic = allBICs.find((v: BIC) => {
        if (
          v.bic.toLowerCase().includes(input.toLowerCase()) ||
          v.bank.toLowerCase().includes(input.toLowerCase())
        ) {
          return true;
        }
        return false;
      });
      if (bic !== undefined) {
        setInput(completeInput(input, bic));
        b = bic.bic;
        bc = bic.countryCode;
      } else {
        bc = input;
        b = "";
      }
      setFilteredBICs([]);
    }
    try {
      getRandom(b, bc, cc).then(
        (iban) => {
          setIBAN(iban);
        },
        (e) => {
          setIBAN(undefined);
          setError(e);
        }
      );
    } catch (e) {
      alert(e);
    }
  }, [input, filteredBICs, allBICs, setInput, setFilteredBICs]);

  const completeInput = (input: string, bic: BIC): string => {
    return input.toLowerCase().includes(bic.bic.toLowerCase())
      ? bic.bic
      : bic.bank;
  };

  const handleSuggestion = useCallback(
    (bic: BIC) => {
      handleInput(completeInput(input, bic));
      setDisplay(false);
      try {
        getRandom(bic.bic).then(
          (iban) => {
            setIBAN(iban);
          },
          (e) => {
            setIBAN(undefined);
            setError(e);
          }
        );
      } catch (e) {
        alert(e);
      }
    },
    [handleInput, input]
  );
  const handleKeyUp = useCallback(
    (e) => {
      if (e.keyCode === 13) {
        handleClick();
        setDisplay(false);
      }
    },
    [handleClick]
  );
  return (
    <div className="App align-items-center">
      <div className="mod">
        <Container>
          <Row className="justify-content-md-center m-3 p-3 h2" id="header">
            IBAN Generator
          </Row>
          <Row>
            <div className="IBAN-module justify-content-md-center">
              <InputGroup>
                <FormControl
                  className="user-input"
                  autoFocus
                  value={input}
                  aria-label="bic or bank code"
                  placeholder="enter bic or bank code"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleInput(e.target.value);
                  }}
                  onKeyUp={(e) => {
                    handleKeyUp(e);
                  }}
                  onFocus={() => setDisplay(true)}
                />
                <Button variant="outline-secondary" onClick={handleClick}>
                  {" "}
                  Generate{" "}
                </Button>
              </InputGroup>
              {filteredBICs.length > 0 && display ? (
                <div className="suggestion-wrapper">
                  {filteredBICs.slice(0, 10).map((b: BIC) => {
                    return (
                      <Suggestion
                        key={b.bic}
                        submit={handleSuggestion}
                        bic={b}
                        setFilteredBICs={setFilteredBICs}
                        setInput={handleInput}
                      />
                    );
                  })}
                </div>
              ) : null}

              <IBAN
                error={error}
                setError={setError}
                display={display}
                gen={iban}
              />
            </div>
          </Row>
        </Container>
      </div>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <div className="footer">
      <a
        className="m-3 footer-element"
        href="https://github.com/leonnicolas/iban-gen-fe"
        rel="nofollow"
        title="GitHub"
      >
        <img className="github-img" src="github.svg" alt="GitHub logo" />
      </a>
    </div>
  );
}
function Suggestion(params: {
  submit: any;
  bic: BIC;
  setFilteredBICs: React.Dispatch<React.SetStateAction<Array<BIC>>>;
  setInput: any;
}) {
  const handleClick = useCallback(() => {
    params.setInput(params.bic.bic);
    params.submit(params.bic);
  }, [params]);
  return (
    <div className="suggestions" onClick={handleClick}>
      <span>{params.bic.bank}</span>{" "}
      <span>
        <i>{params.bic.bic}</i>
      </span>
    </div>
  );
}

export default App;
