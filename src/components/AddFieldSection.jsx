// src/components/AddFieldSection.jsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MapLocationPicker from "./MapLocationPicker";
import { Combobox, ComboboxMultiSelect } from "@/components/ui/combobox";

export default function Add({ fields, lang, values, onChange, errors, touched }) { // Added errors prop for completeness
  const commonInputClass =
    "rounded-[15px] border border-gray-300 focus:border-bg-primary focus:ring-bg-primary";

  const handleChange = (name, value) => {
    console.log(`Add handleChange: name=${name}, value=`, value); // Debug log
    // In this specific application (AddCashier), the fields define their own onChange, 
    // but for generic fields (like Switch/Combobox), we use the parent onChange.
    if (onChange) {
      onChange(lang, name, value);
    }
  };

  // Separate map fields from other fields
  const mapFields = fields.filter((field) => field.type === "map");
  const otherFields = fields.filter((field) => field.type !== "map");

  return (
    <div className="w-full space-y-6">
      {/* Render other fields in the grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {otherFields.map((field, index) => {
          // Check for showIf condition before rendering
          if (field.showIf && !field.showIf(values)) return null;

          let value;

          // Handle duration fields specially (Existing logic)
          if (field.name.startsWith('durations_')) {
            const planId = field.name.replace('durations_', '');
            value = values.planDurations?.[planId] || [];
          } else {
            // 🚨 THE FIX: Prioritize value from the field object (used by multi-language names)
            // If field.value is defined, use it. Otherwise, use the generic values[field.name].
            value = field.value !== undefined ? field.value : values?.[field.name] || "";
          }

          console.log(`Rendering field: ${field.name}, resolved value=`, value); // Debug log

          const fieldId = `${field.name}-${lang}-${index}`;

          // ONLY show the error if the user has interacted with the field
          const errorMessage = touched?.[field.name] ? errors?.[field.name] : null;

          return (
            <div key={index} className="space-y-2">
              <label
                htmlFor={field.name}
                className="block text-sm !p-3 font-medium text-gray-700"
              >
                {field.label || field.placeholder || field.name} {/* Use label if present */}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {(() => {
                switch (field.type) {
                  case "input":
                    return (
                      <Input
                        id={field.name}
                        key={index}
                        type={field.inputType || "text"}
                        placeholder={field.placeholder}
                        value={value} // Uses the correctly resolved 'value'
                        // If the field provided a specific onChange, use it directly (as in AddCashier.jsx)
                        // otherwise, use the generic handleChange.
                        onChange={field.onChange ? (e) => field.onChange(e.target.value) : (e) => handleChange(field.name, e.target.value)}
                        className={`!px-5 !py-4 ${commonInputClass} ${errorMessage ? 'border-red-500' : ''}`}
                      />
                    );
                  case "time":
                    return (
                      <Input
                        id={field.name}
                        key={index}
                        type="time"
                        placeholder={field.placeholder}
                        value={value}
                        onChange={field.onChange ? (e) => field.onChange(e.target.value) : (e) => handleChange(field.name, e.target.value)}
                        className={`!px-5 !py-6 ${commonInputClass} ${errorMessage ? 'border-red-500' : ''}`}
                        step={field.step || "1"}
                      />
                    );
                  case "textarea":
                    return (
                      <Textarea
                        id={field.name}
                        key={index}
                        placeholder={field.placeholder}
                        value={value}
                        rows={2}
                        onChange={field.onChange ? (e) => field.onChange(e.target.value) : (e) => handleChange(field.name, e.target.value)}
                        className={`min-h-[40px] !px-5 !py-3 ${commonInputClass} ${errorMessage ? 'border-red-500' : ''}`}
                      />
                    );
                  case "file":
                    return (
                      <div className="flex items-center">
                        <Input
                          id={field.name}
                          type="file"
                          onChange={(e) => {
                            const selectedFile = e.target.files?.[0];
                            const safeValue = selectedFile instanceof File ? selectedFile : null;

                            if (field.onChange) {
                              field.onChange(safeValue);
                            } else {
                              handleChange(field.name, safeValue);
                            }
                          }}
                          className={`min-h-[46px] flex items-center text-gray-500 ${commonInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 ${errorMessage ? 'border-red-500' : ''}`}
                          accept={field.accept || "image/*"}
                        />
                      </div>
                    );
                  case "multi-select":
                    return (
                      <ComboboxMultiSelect
                        id={fieldId}
                        value={value}
                        onValueChange={field.onChange ? field.onChange : (val) => handleChange(field.name, val)}
                        options={field.options}
                        placeholder={field.placeholder}
                        className={`w-full !px-5 !py-6 ${commonInputClass} ${errorMessage ? 'border-red-500' : ''}`}
                      />
                    );
                  case "select":
                    return (
                      <Combobox
                        id={fieldId}
                        value={value}
                        onValueChange={field.onChange ? field.onChange : (val) => handleChange(field.name, val)}
                        options={field.options}
                        placeholder={field.placeholder}
                        className={`w-full !px-5 !py-6 ${commonInputClass} ${errorMessage ? 'border-red-500' : ''}`}
                      />
                    );
                  case "switch":
                    // Value for switch is passed as boolean from AddCashier.jsx
                    const isChecked = typeof value === 'boolean' ? value : value === 1;
                    return (
                      <div className="flex ml-3 items-center gap-3">
                        <Switch
                          id={field.name}
                          checked={isChecked}
                          onCheckedChange={field.onChange ? field.onChange : (checked) => handleChange(field.name, checked)}
                          className={`
                            ${field.switchClassName || ''},
                            ${isChecked ? "data-[state=checked]:bg-bg-primary dark:data-[state=checked]:bg-bg-primary" : ""}
                          `}
                        />
                        <label
                          htmlFor={field.name}
                          className={`
                            text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70,
                            ${isChecked ? "text-bg-primary dark:text-bg-primary" : "text-foreground"}
                          `}
                        >
                          {isChecked ? (field.activeLabel || "Active") : (field.inactiveLabel || "Inactive")}
                        </label>
                      </div>
                    );
                  default:
                    return null;
                }
              })()}
              {/* Display error message */}
              {errorMessage && (
                <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
              )}
            </div>
          );
        })}
      </div>
      {/* Render map fields first, outside the grid */}
      {mapFields.map((field, index) => {
        if (field.showIf && !field.showIf(values)) return null;
        // Map fields always read from values since they are not multi-lang
        const value = values?.[field.name] || "";
        const errorMessage = errors?.[field.name];

        return (
          <div key={`map-${index}`} className="w-full space-y-2">
            <label
              htmlFor={field.name}
              className="block text-sm !p-3 font-medium text-gray-700"
            >
              {field.label || field.placeholder || field.name}
            </label>
            <MapLocationPicker
              value={value}
              onChange={field.onChange ? field.onChange : (val) => handleChange(field.name, val)}
              placeholder={field.placeholder}
            />
            {errorMessage && (
              <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}