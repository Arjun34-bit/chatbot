import React from "react";
import HashLoader from "react-spinners/HashLoader";
import SyncLoader from "react-spinners/SyncLoader";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const Spinner = ({ loading, size, color, spinner }) => {
  return (
    <div>
      {spinner === "sync" ? (
        <SyncLoader
          color={color}
          loading={loading}
          cssOverride={override}
          size={size}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      ) : (
        <HashLoader
          color={color}
          loading={loading}
          cssOverride={override}
          size={size}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      )}
    </div>
  );
};

export default Spinner;
