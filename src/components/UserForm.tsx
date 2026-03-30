import type { FormState } from "../config/types";

interface UserFormProps {
    form: FormState;
    isEditing: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

export function UserForm({
    form,
    isEditing,
    onChange,
    onSubmit,
    onCancel,
}: UserFormProps) {
    return (
        <div className="form-card">
            <h2 className={isEditing ? "editing" : ""}>
                {isEditing ? "Edit User" : "Add User"}
            </h2>
            <form onSubmit={onSubmit}>
                <div className="form-grid">
                    <div className="input-wrap">
                        <label htmlFor="name">Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={onChange}
                            placeholder="Name"
                            required
                        />
                    </div>
                    <div className="input-wrap">
                        <label htmlFor="email">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={onChange}
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="input-wrap">
                        <label htmlFor="phone">Phone</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={onChange}
                            placeholder="Phone"
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? '↑ Update' : '+ Add'}
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