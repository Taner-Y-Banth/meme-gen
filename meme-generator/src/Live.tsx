import { Grid } from "@mui/material";
import Button from "@mui/material/Button";
import { NstrumentaBrowserClient } from "nstrumenta/dist/browser/client";
import React from "react";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "./index.css";

const Meme = () => {
  const { search } = useLocation();
  const [responseChannel, setResponseChannel] = React.useState(uuidv4());
  const [quote, setQuote] = React.useState("default meme");
  const [image, setImage] = React.useState(
    "https://variety.com/wp-content/uploads/2021/07/Rick-Astley-Never-Gonna-Give-You-Up.png?w=681&h=383&crop=1"
  );
  const nstClientRef = React.useRef<NstrumentaBrowserClient>(null);

  React.useEffect(() => {
    const wsUrlParam = new URLSearchParams(search).get("wsUrl");
    const wsUrl = wsUrlParam
      ? wsUrlParam
      : window.location.origin.replace("http", "ws");
    const apiKeyParam = new URLSearchParams(search).get("apiKey");
    if (apiKeyParam) {
      localStorage.setItem("apiKey", apiKeyParam);
    }

    const apiLocalStore = localStorage.getItem("apiKey");
    const apiKey = apiKeyParam ? apiKeyParam : apiLocalStore;

    nstClientRef.current = new NstrumentaBrowserClient();

    nstClientRef.current.addListener("open", () => {
      nstClientRef.current.addSubscription(responseChannel, (response) => {
        if (response.quote) {
          setQuote(response.quote);
        }
        if (response.imageUrl) {
          setImage(response.imageUrl);
        }
      });
    });

    nstClientRef.current.connect({ wsUrl, apiKey });
  }, []);

  const textgen = React.useCallback(() => {
    nstClientRef.current?.send("textgen", {
      responseChannel,
    });
  }, []);

  const imggen = React.useCallback(() => {
    nstClientRef.current?.send("imggen", {
      responseChannel,
    });
  }, []);

  const memegen = React.useCallback(() => {
    imggen();
    textgen();
  }, []);

  return (
    <>
      <h1
        style={{
          textAlign: "center",
          fontFamily: "Trebuchet MS",
          color: "white",
        }}
      >
        Meme Generator
      </h1>
      <div
        style={{
          display: "grid",
          padding: "20px",
        }}
      >
        <svg
          xmlns={image}
          style={{
            width: "100%",
            height: "500px",
            gridRowStart: 1,
            gridColumnStart: 1,
            zIndex: 1,
          }}
        >
          <image href={image} x="0" y="0" height="100%" width="100%" />{" "}
        </svg>
        <svg
          style={{
            width: "100%",
            height: "100%",
            gridRowStart: 2,
            gridColumnStart: 1,
            zIndex: 2,
            alignContent: "center"
          }}
        >
          <>
            <text
              fill="black"
              fontSize="20"
              x="50%"
              y="50%"
              textAnchor={"middle"}
              dominantBaseline={"middle"}
              fontFamily="Trebuchet MS"
            >
              {quote}
            </text>
          </>
        </svg>
      </div>

      <Grid
        container
        spacing={2}
        direction={"row"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Grid item>
          <Button color="inherit" variant="outlined" onClick={imggen}>
            NEW IMAGE
          </Button>
        </Grid>
        <Grid item>
          <Button color="inherit" variant="outlined" onClick={textgen}>
            NEW TEXT
          </Button>
        </Grid>
        <Grid item>
          <Button color="inherit" variant="outlined" onClick={memegen}>
            NEW MEME
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default Meme;
