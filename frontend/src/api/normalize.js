const isObjectLike = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export const extractApiData = (response) => {
  const body = response?.data;

  if (!body) {
    return null;
  }

  if (body.data !== undefined && body.data !== null) {
    return body.data;
  }

  if (Array.isArray(body.success) || isObjectLike(body.success)) {
    return body.success;
  }

  if (Array.isArray(body.message) || isObjectLike(body.message)) {
    return body.message;
  }

  return body;
};

export const extractApiMessage = (response) => {
  const body = response?.data;

  if (!body) {
    return 'Request succeeded';
  }

  if (typeof body.message === 'string') {
    return body.message;
  }

  if (typeof body.success === 'string') {
    return body.success;
  }

  return 'Request succeeded';
};

export const normalizeApiError = (error) => {
  const payload = error?.response?.data ?? {};
  const message = payload.message || payload.success || error?.message || 'Request failed';

  return {
    statusCode: payload.statusCode ?? error?.response?.status ?? 500,
    message,
    errors: payload.errors ?? [],
    raw: payload,
  };
};