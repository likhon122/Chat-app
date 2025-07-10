(async () => {
  const fetchUser = async () => {
    try {
      const response = await fetch(
        "https://chat-app-backend-fawn-two.vercel.app/api/v1/user/search-user?name=li",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const res = await response.json();
      console.log(res);
      return res;
    } catch (error) {
      console.error("Fetch error: sadjhfasdf", error);
      return null;
    }
  };

  const first = await fetchUser();

  console.log(first);
})();
