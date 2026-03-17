import { useEffect, useMemo, useState } from 'react';

function parseCommaSeparated(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyCommaSeparated(value) {
  return Array.isArray(value) ? value.join(', ') : value || '';
}

export default function ScenarioCommaSeparatedInput({
  value,
  onChange,
  className = '',
  placeholder = '',
}) {
  const externalText = useMemo(() => stringifyCommaSeparated(value), [value]);
  const [inputValue, setInputValue] = useState(externalText);

  useEffect(() => {
    const parsedInputValue = parseCommaSeparated(inputValue);
    const parsedExternalValue = Array.isArray(value)
      ? value
      : parseCommaSeparated(externalText);

    if (JSON.stringify(parsedInputValue) !== JSON.stringify(parsedExternalValue)) {
      setInputValue(externalText);
    }
  }, [externalText, inputValue, value]);

  const handleChange = (e) => {
    const nextValue = e.target.value;
    setInputValue(nextValue);
    onChange(parseCommaSeparated(nextValue));
  };

  const handleBlur = () => {
    setInputValue(stringifyCommaSeparated(parseCommaSeparated(inputValue)));
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
    />
  );
}