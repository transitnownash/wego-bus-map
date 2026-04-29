import '@testing-library/jest-dom';

Object.defineProperty(window, 'scrollTo', {
	value: () => {},
	writable: true,
});
