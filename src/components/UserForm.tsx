import type { FormState } from "../config/types";

interface UserFormProps {
    form: FormState;
    isEditing: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

export function UserForm({ form, isEditing, onChange, onSubmit, onCancel }: UserFormProps) {
    // 1. Define your fields configuration here
    const fields: Array<{ name: keyof FormState; label: string; type?: string; options?: string[] }> = [
        { name: "name", label: "Name" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone" },
        { name: "role", label: "Role", type: "select", options: ["Admin", "User", "Guest"] },
        { name: "bio", label: "Bio", type: "textarea" }
    ];

    return (
        <div className="form-card">
            <h2 className={isEditing ? "editing" : ""}>
                {isEditing ? "Edit User" : "Add User"}
            </h2>
            <form onSubmit={onSubmit}>
                <div className="form-grid">

                    {/* 2. Map through the fields to render inputs dynamically */}
                    {fields.map(({ name, label, type = "text", options }) => (
                        <div key={name} className="input-wrap">
                            <label htmlFor={name}>{label}</label>
                            {type === "select" ? (
                                <select id={name} name={name} value={form[name] as string} onChange={onChange}>
                                    {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : type === "textarea" ? (
                                <textarea id={name} name={name} value={form[name] as string} onChange={onChange} />
                            ) : (
                                <input id={name} name={name} type={type} value={form[name] as string} onChange={onChange} />
                            )}
                        </div>
                    ))}

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? "↑ Update" : "+ Add"}
                        </button>
                        {isEditing && (
                            <button type="button" className="btn btn-ghost" onClick={onCancel}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}