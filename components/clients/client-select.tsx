import { useState, useEffect } from "react";
import { useGetClients } from "@/queries/clients/get-client";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";

interface ClientSelectProps {
  control: Control<any>;
  name: string;
  label?: string;
  description?: string;
  onAddNewClick?: () => void;
  disabled?: boolean;
}

export function ClientSelect({
  control,
  name,
  label = "Owner",
  description,
  onAddNewClick,
  disabled = false,
}: ClientSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const { data: clientsData, isLoading, isError, refetch } = useGetClients(1, 20, debouncedSearch);
  const clients = clientsData?.items || [];

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  {field.value ? (
                    clients?.find((client) => client.id === field.value)
                      ? `${clients.find((client) => client.id === field.value)?.firstName} ${clients.find((client) => client.id === field.value)?.lastName}`
                      : "Select owner"
                  ) : (
                    "Select owner"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput 
                  placeholder="Search owners..." 
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : isError ? (
                    <div className="py-6 text-center text-sm">
                      <p className="text-destructive">Error loading owners.</p>
                      <Button
                        variant="link"
                        onClick={() => refetch()}
                        className="mt-2"
                      >
                        Try again
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>
                        <div className="py-6 text-center text-sm">
                          <p>No owner found.</p>
                          {onAddNewClick && (
                            <Button
                              variant="link"
                              onClick={() => {
                                setOpen(false);
                                onAddNewClick();
                              }}
                              className="mt-2 text-primary"
                            >
                              + Add a new owner
                            </Button>
                          )}
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {clients?.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.id}
                            onSelect={() => {
                              field.onChange(client.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                client.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {client.firstName} {client.lastName}
                            <span className="ml-2 text-muted-foreground text-xs">
                              {client.email}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {onAddNewClick && clients && clients.length > 0 && (
                        <div className="p-2 border-t">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setOpen(false);
                              onAddNewClick();
                            }}
                            className="w-full justify-start text-primary"
                          >
                            + Add a new owner
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 