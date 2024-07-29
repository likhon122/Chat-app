import React, { useEffect } from "react";

import { useParams } from "react-router-dom";
import { serverUrl } from "../../..";
import axios from "axios";

const Verify = () => {
  const { token } = useParams();
  console.log(token);
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.post(
          `${serverUrl}/api/v1/user/verify`,
          { token },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        const data = response?.data;
        // dispatch(setUser(user));
        console.log(data);
      } catch (error) {
        console.error("Error fetching Verify User:", error);
      }
    })();
  }, [token]);

  return <div>Verify</div>;
};

export default Verify;
