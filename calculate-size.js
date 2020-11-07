export default (requestedSize, min, max, snap) => {
	const value = Math.max(min, Math.min(max || requestedSize, requestedSize));
	if (value < snap) {
		return value * 2 >= snap ? snap : 0;
	}

	return value;
};
