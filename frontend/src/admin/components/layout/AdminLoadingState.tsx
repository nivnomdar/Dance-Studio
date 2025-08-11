import React from 'react';
import { LoadingPage } from '../../../components/common';

interface AdminLoadingStateProps {
  message?: string;
}

export default function AdminLoadingState({ message = "טוען..." }: AdminLoadingStateProps) {
  return <LoadingPage message={message} />;
} 