'use client';

import { useEffect, useState } from 'react';
import { EllipseTable } from '../../components/EllipseTable';
import { ImageWithEllipses } from '../../components/ImageWithEllipses';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { getImagePublicUrl } from '../../lib/getImagePublicUrl';
import { getEllipses } from '../../repositories/ellipseRepository';
import { imageMetaRepository } from '../../repositories/imageMetaRepository';
import { imageThumbnailRepository } from '../../repositories/imageThumbnailRepository';
import { fetchAllUsers } from '../../repositories/userRepository';
import type { Ellipse } from '../../types/ellipse';
import type { ImageMetaCamel } from '../../types/imageMeta';
import type { ImageThumbnail } from '../../types/imageThumbnail';
import { User } from '../../types/user';

export default function AdminPage() {
  // ユーザー一覧取得
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // サムネイル関連
  const [thumbnails, setThumbnails] = useState<ImageThumbnail[]>([]);
  const [selectedImageMetaId, setSelectedImageMetaId] = useState<
    string | undefined
  >(undefined);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [thumbError, setThumbError] = useState<string | null>(null);

  // imageMeta取得用
  const [imageMeta, setImageMeta] = useState<ImageMetaCamel | null>(null);
  const [imageMetaLoading, setImageMetaLoading] = useState(false);
  const [imageMetaError, setImageMetaError] = useState<string | null>(null);

  // 画像URL取得用
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // 楕円リスト取得用
  const [ellipses, setEllipses] = useState<Ellipse[]>([]);
  const [ellipsesLoading, setEllipsesLoading] = useState(false);
  const [ellipsesError, setEllipsesError] = useState<string | null>(null);
  // 選択中の楕円IDリスト
  const [selectedEllipseIds, setSelectedEllipseIds] = useState<string[]>([]);

  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ユーザー選択時にサムネイル一覧を取得
  useEffect(() => {
    if (!selectedUid) {
      setThumbnails([]);
      setSelectedImageMetaId(undefined);
      return;
    }
    setThumbLoading(true);
    setThumbError(null);
    imageThumbnailRepository
      .fetchByUserId(selectedUid)
      .then((data) => {
        setThumbnails(data);
        setSelectedImageMetaId(undefined);
      })
      .catch((e) => setThumbError(e.message))
      .finally(() => setThumbLoading(false));
  }, [selectedUid]);

  // image_meta_id選択時にimageMetaを取得
  useEffect(() => {
    if (!selectedImageMetaId) {
      setImageMeta(null);
      return;
    }
    setImageMetaLoading(true);
    setImageMetaError(null);
    imageMetaRepository
      .fetchByIdCamel(selectedImageMetaId)
      .then(({ data, error }) => {
        if (error) setImageMetaError(error.message ?? String(error));
        setImageMeta(data);
      })
      .catch((e) => setImageMetaError(e.message))
      .finally(() => setImageMetaLoading(false));
  }, [selectedImageMetaId]);

  // imageMeta変更時に画像URLを取得
  useEffect(() => {
    if (!imageMeta || !imageMeta.storagePath) {
      setImageUrl(null);
      return;
    }
    // バケット名は固定
    const bucket = 'pin-comment-images';
    getImagePublicUrl(bucket, imageMeta.storagePath).then(setImageUrl);
  }, [imageMeta]);

  // image_meta_id選択時に楕円リストを取得
  useEffect(() => {
    if (!selectedImageMetaId) {
      setEllipses([]);
      return;
    }
    setEllipsesLoading(true);
    setEllipsesError(null);
    getEllipses(selectedImageMetaId)
      .then(setEllipses)
      .catch((e) => setEllipsesError(e.message))
      .finally(() => setEllipsesLoading(false));
  }, [selectedImageMetaId]);

  return (
    <main className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>Admin Page</h1>
      <div className='mb-4'>
        <label className='block mb-2 font-semibold'>ユーザー選択</label>
        {loading ? (
          <div>読み込み中...</div>
        ) : error ? (
          <div className='text-red-500'>ユーザー取得エラー: {error}</div>
        ) : (
          <Select value={selectedUid ?? ''} onValueChange={setSelectedUid}>
            <SelectTrigger className='min-w-[200px]'>
              <SelectValue placeholder='ユーザーを選択してください' />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.uid} value={user.uid}>
                  {user.display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {/* サムネイルセレクタ */}
      {selectedUid && (
        <div className='mb-4 mt-6'>
          <label className='block mb-2 font-semibold'>image_meta_id 選択</label>
          {thumbLoading ? (
            <div>サムネイル取得中...</div>
          ) : thumbError ? (
            <div className='text-red-500'>
              サムネイル取得エラー: {thumbError}
            </div>
          ) : thumbnails.length === 0 ? (
            <div className='text-gray-400'>サムネイルがありません</div>
          ) : (
            <Select
              value={selectedImageMetaId ?? ''}
              onValueChange={setSelectedImageMetaId}
            >
              <SelectTrigger className='min-w-[200px]'>
                <SelectValue placeholder='image_meta_id を選択してください' />
              </SelectTrigger>
              <SelectContent>
                {thumbnails.map((thumb) =>
                  thumb.imageMetaId ? (
                    <SelectItem key={thumb.id} value={thumb.imageMetaId}>
                      {thumb.imageMetaId}
                    </SelectItem>
                  ) : null
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      {/* imageMetaの画像・楕円リスト */}
      {selectedImageMetaId && (
        <div className='mt-4 '>
          <div className='flex gap-4'>
            {/* 左カラム: サムネイル画像 */}
            <div className='flex-1 flex items-center justify-center min-h-[180px]'>
              {imageMetaLoading ? (
                <div>imageMeta取得中...</div>
              ) : imageMetaError ? (
                <div className='text-red-500'>
                  imageMeta取得エラー: {imageMetaError}
                </div>
              ) : imageMeta ? (
                <ImageWithEllipses
                  imageUrl={imageUrl}
                  fileName={imageMeta.fileName}
                  ellipses={ellipses}
                  selectedEllipseIds={selectedEllipseIds}
                />
              ) : (
                <div className='text-gray-400'>データなし</div>
              )}
            </div>
            {/* 右カラム: 楕円リストテーブル */}
            <div className='flex-1'>
              <EllipseTable
                ellipses={ellipses}
                loading={ellipsesLoading}
                error={ellipsesError}
                selectedEllipseIds={selectedEllipseIds}
                setSelectedEllipseIds={setSelectedEllipseIds}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
