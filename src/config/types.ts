interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

type FormState = Omit<User, "id">;
type EditingId = User["id"] | null;

const INITIAL_FORM: FormState = { name: "", email: "", phone: "" };

export type { User, FormState, EditingId };
export { INITIAL_FORM };
