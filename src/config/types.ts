interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
}

type FormState = Omit<User, "id">;
type EditingId = User["id"] | null;

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  role: "",
  bio: "",
};

export type { User, FormState, EditingId };
export { INITIAL_FORM };
