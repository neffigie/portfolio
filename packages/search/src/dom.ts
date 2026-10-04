export function requiredElement<T extends Element>(
  root: ParentNode,
  selector: string,
  owner: string,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing ${owner} element: ${selector}`);
  return element;
}
