import { supabase } from '@/utils/supabase';

export async function signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error;
}

export async function signUp(
    email: string,
    password: string,
    nombre: string,
): Promise<void> {
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre } },
    })
    if (error) throw error
}

export async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}