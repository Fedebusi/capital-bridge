import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useCreateBorrower, useUpdateBorrower } from "@/hooks/useSupabaseQuery";
import type { Borrower, BorrowerRating } from "@/data/borrowers";

const borrowerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  group: z.string().min(1, "Group is required"),
  type: z.string().min(1),
  internalRating: z.string().default("unrated"),
  headquarters: z.string().min(1, "Headquarters is required"),
  yearEstablished: z.coerce.number().int().min(1900).max(2030),
  website: z.string().optional(),
  description: z.string(),
});

type BorrowerFormData = z.infer<typeof borrowerSchema>;

interface BorrowerFormDialogProps {
  borrower?: Borrower;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function BorrowerFormDialog({ borrower, trigger, onSuccess }: BorrowerFormDialogProps) {
  const [open, setOpen] = useState(false);
  const createBorrower = useCreateBorrower();
  const updateBorrower = useUpdateBorrower();
  const isLive = isSupabaseConfigured();
  const isEdit = !!borrower;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BorrowerFormData>({
    resolver: zodResolver(borrowerSchema),
    defaultValues: borrower
      ? {
          name: borrower.name,
          group: borrower.group,
          type: borrower.type,
          internalRating: borrower.internalRating,
          headquarters: borrower.headquarters,
          yearEstablished: borrower.yearEstablished,
          website: borrower.website ?? "",
          description: borrower.description,
        }
      : {
          type: "Developer",
          internalRating: "unrated",
          yearEstablished: 2020,
        },
  });

  async function onSubmit(data: BorrowerFormData) {
    try {
      if (isLive) {
        if (isEdit && borrower) {
          await updateBorrower.mutateAsync({
            id: borrower.id,
            name: data.name,
            group_name: data.group,
            type: data.type as Borrower["type"],
            internal_rating: data.internalRating as BorrowerRating,
            headquarters: data.headquarters,
            year_established: data.yearEstablished,
            website: data.website || null,
            description: data.description,
          });
        } else {
          await createBorrower.mutateAsync({
            name: data.name,
            group_name: data.group,
            type: data.type as Borrower["type"],
            internal_rating: data.internalRating as BorrowerRating,
            rating_date: new Date().toISOString().slice(0, 10),
            headquarters: data.headquarters,
            year_established: data.yearEstablished,
            website: data.website || null,
            description: data.description,
            total_exposure: 0,
            total_commitments: 0,
            number_of_active_deals: 0,
            avg_irr: null,
            avg_multiple: null,
          });
        }
      }
      toast.success(isEdit ? "Borrower updated" : "Borrower created");
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      const detail = err instanceof Error ? err.message : undefined;
      toast.error(
        isEdit ? "We couldn't save this borrower." : "We couldn't create this borrower.",
        {
          description: detail
            ? `Please try again in a moment. Details: ${detail}`
            : "Please check your connection and try again. If the problem persists, contact support.",
        },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm shadow-accent/20">
            <Plus className="h-4 w-4" />
            New Borrower
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Borrower" : "Add New Borrower"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Legal Name *</Label>
                <Input {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Group *</Label>
                <Input {...register("group")} />
                {errors.group && <p className="text-xs text-destructive">{errors.group.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue={watch("type")} onValueChange={(v) => setValue("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Developer">Developer</SelectItem>
                    <SelectItem value="Sponsor">Sponsor</SelectItem>
                    <SelectItem value="Developer & Sponsor">Developer & Sponsor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Internal Rating</Label>
                <Select defaultValue={watch("internalRating")} onValueChange={(v) => setValue("internalRating", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="unrated">Unrated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Headquarters *</Label>
                <Input {...register("headquarters")} />
                {errors.headquarters && <p className="text-xs text-destructive">{errors.headquarters.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Year Established</Label>
                <Input type="number" {...register("yearEstablished")} />
                {errors.yearEstablished && <p className="text-xs text-destructive">{errors.yearEstablished.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input {...register("website")} placeholder="www.company.com" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register("description")} rows={3} />
            </div>

            <Button type="submit" className="w-full" disabled={createBorrower.isPending || updateBorrower.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? "Save Changes" : "Create Borrower"}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
