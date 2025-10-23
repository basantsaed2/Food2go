import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MapLocationPicker from "./MapLocationPicker";
import { Combobox, ComboboxMultiSelect } from "@/components/ui/combobox";

export default function Add({ fields, lang, values, onChange }) {
  const commonInputClass =
    "rounded-[15px] border border-gray-300 focus:border-bg-primary focus:ring-bg-primary";

  const handleChange = (name, value) => {
    console.log(`Add handleChange: name=${name}, value=`, value); // Debug log
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

          // Handle duration fields specially
          let value = values?.[field.name] || "";
          if (field.name.startsWith('durations_')) {
            const planId = field.name.replace('durations_', '');
            value = values.planDurations?.[planId] || [];
          }

          console.log(`Rendering field: ${field.name}, value=`, value); // Debug log

          const fieldId = `${field.name}-${lang}-${index}`;
          return (
            <div key={index} className="space-y-2">
              <label
                htmlFor={field.name}
                className="block text-sm !p-3 font-medium text-gray-700"
              >
                {field.placeholder ? field.placeholder : field.name}
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
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`!px-5 !py-4 ${commonInputClass}`}
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
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`!px-5 !py-6 ${commonInputClass}`}
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
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`min-h-[40px] !px-5 !py-3 ${commonInputClass}`}
                      />
                    );
                  case "file":
                    return (
                      <div className="flex items-center">
                        <Input
                          id={field.name}
                          type="file"
                          onChange={(e) => handleChange(field.name, e.target.files?.[0])}
                          className={`min-h-[46px] flex items-center text-gray-500 ${commonInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200`}
                          accept={field.accept || "image/*"}
                        />
                      </div>
                    );
                  case "multi-select":
                    return (
                      <ComboboxMultiSelect
                        id={fieldId}
                        value={value}
                        onValueChange={(val) => handleChange(field.name, val)}
                        options={field.options}
                        placeholder={field.placeholder}
                        className={`w-full !px-5 !py-6 ${commonInputClass}`}
                      />
                    );
                  case "select":
                    return (
                      <Combobox
                        id={fieldId}
                        value={value}
                        onValueChange={(val) => handleChange(field.name, val)}
                        options={field.options}
                        placeholder={field.placeholder}
                        className={`w-full !px-5 !py-6 ${commonInputClass}`}
                      />
                    );
                  case "switch":
                    // Convert value to lowercase for comparison to handle both "Active" and "active"
                    const isChecked = value?.toLowerCase() === "active";
                    return (
                      <div className="flex items-center gap-3">
                        <Switch
                          id={field.name}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const newValue = checked ? "Active" : "Inactive"; // Use the same capitalization as your data
                            handleChange(field.name, newValue);
                          }}
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
            </div>
          );
        })}
      </div>
      {/* Render map fields first, outside the grid */}
      {mapFields.map((field, index) => {
        if (field.showIf && !field.showIf(values)) return null;
        const value = values?.[field.name] || "";
        return (
          <div key={`map-${index}`} className="w-full space-y-2">
            <label
              htmlFor={field.name}
              className="block text-sm !p-3 font-medium text-gray-700"
            >
              {field.placeholder ? field.placeholder : field.name}
            </label>
            <MapLocationPicker
              value={value}
              onChange={(val) => handleChange(field.name, val)}
              placeholder={field.placeholder}
            />
          </div>
        );
      })}
    </div>
  );
}