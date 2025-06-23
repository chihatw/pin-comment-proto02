import { supabase } from '../lib/supabaseClient';
import { PIN_COMMENT_ADMIN_STATE_ID } from '../utils/constants';

export type PinCommentAdminState = {
  id: string;
  selected_image_meta_id: string | null;
  selected_ellipse_ids: string[] | null;
  blur: number | null;
  gradient: number | null;
  position_y: number | null;
  updated_at: string;
};

/**
 * 管理用状態を取得
 */
export async function fetchPinCommentAdminState(): Promise<PinCommentAdminState | null> {
  const { data, error } = await supabase
    .from('pin_comment_admin_state')
    .select('*')
    .eq('id', PIN_COMMENT_ADMIN_STATE_ID)
    .single();
  if (error) throw error;
  return data;
}

/**
 * 管理用状態を更新
 */
export async function updatePinCommentAdminState(
  params: Partial<
    Pick<
      PinCommentAdminState,
      | 'selected_image_meta_id'
      | 'selected_ellipse_ids'
      | 'blur'
      | 'gradient'
      | 'position_y'
    >
  >
): Promise<PinCommentAdminState | null> {
  const { data, error } = await supabase
    .from('pin_comment_admin_state')
    .update({ ...params, updated_at: new Date().toISOString() })
    .eq('id', PIN_COMMENT_ADMIN_STATE_ID)
    .select()
    .single();
  if (error) throw error;
  return data;
}
