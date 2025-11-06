const logService = async (postData) => {
  try {
    // convert it to fetch
    await fetch(
      "https://bcldvportal.birlacorp.com/depot/rfc-reducer/log-service",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      }
    );
  } catch (error) {
    logService(postData);
  }
};

export default logService;
