import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodSchema } from 'zod'
import type { FieldValues, UseFormProps, UseFormReturn, Path } from 'react-hook-form'
import { useCallback } from 'react'

/**
 * Enhanced hook for React Hook Form with Zod validation
 */
export function useZodForm<T extends FieldValues>(
  schema: ZodSchema<T>,
  options?: Omit<UseFormProps<T>, 'resolver'>
) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...options,
  })

  const validateField = useCallback(
    async (name: Path<T>) => {
      const value = form.getValues(name)
      try {
        await schema.parseAsync({ [name]: value } as any)
        form.clearErrors(name)
        return true
      } catch (error) {
        return false
      }
    },
    [form, schema]
  )

  const validateForm = useCallback(async () => {
    const values = form.getValues()
    try {
      const validated = await schema.parseAsync(values)
      form.clearErrors()
      return { isValid: true, data: validated }
    } catch (error) {
      return { isValid: false, error }
    }
  }, [form, schema])

  return {
    ...form,
    validateField,
    validateForm,
    schema,
  }
}

export type UseZodFormReturn<T extends FieldValues> = UseFormReturn<T> & {
  validateField: (name: Path<T>) => Promise<boolean>
  validateForm: () => Promise<{ isValid: boolean; data?: T; error?: any }>
  schema: ZodSchema<T>
}