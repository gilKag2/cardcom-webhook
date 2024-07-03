export const buildQueryString = (data) => {
  const params = new URLSearchParams();

  for (const key in data) {
    if (typeof data[key] === "object" && !Array.isArray(data[key])) {
      for (const subKey in data[key]) {
        params.append(`${key}.${subKey}`, data[key][subKey]);
      }
    } else if (Array.isArray(data[key])) {
      data[key].forEach((item, index) => {
        for (const subKey in item) {
          params.append(`${key}${index + 1}.${subKey}`, item[subKey]);
        }
      });
    } else {
      params.append(key, data[key]);
    }
  }

  return params.toString();
};

export const parseResponseData = (responseData) => {
  const params = new URLSearchParams(responseData);
  const parsedData = {};
  for (const [key, value] of params) {
    parsedData[key] = value;
  }
  return parsedData;
};
