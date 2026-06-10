import { Categoria } from '@/types/database';
import { supabase } from '@/utils/supabase';

type CategoriaRow = {
  id: number;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  color: string | null;
  categoria_pregunta: { count: number }[];
};

const SELECT = 'id, nombre, descripcion, icono, color, categoria_pregunta(count)';

function mapCategoria(c: CategoriaRow): Categoria {
  return {
    id: c.id,
    nombre: c.nombre,
    descripcion: c.descripcion,
    icono: c.icono,
    color: c.color,
    cantidad_preguntas: c.categoria_pregunta?.[0]?.count ?? 0,
  };
}

export async function getCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categoria')
    .select(SELECT)
    .order('nombre', { ascending: true });

  if (error) throw error;
  return (data as CategoriaRow[] ?? []).map(mapCategoria);
}

export async function getCategoriaById(id: number): Promise<Categoria> {
  const { data, error } = await supabase
    .from('categoria')
    .select(SELECT)
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapCategoria(data as CategoriaRow);
}