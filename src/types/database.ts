
export interface Database {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string
          asset_code: string
          name: string
          default_location: string
          status: 'available' | 'out'
          current_inspection_id: string | null
        }
        Insert: {
          id?: string
          asset_code: string
          name: string
          default_location: string
          status?: 'available' | 'out'
          current_inspection_id?: string | null
        }
        Update: {
          id?: string
          asset_code?: string
          name?: string
          default_location?: string
          status?: 'available' | 'out'
          current_inspection_id?: string | null
        }
      }
      inspections: {
        Row: {
          id: string
          asset_id: string
          workflow_name: string
          location: string
          type: 'checkout' | 'return' | 'update'
          status: 'open' | 'closed'
          created_at: string
          closed_at: string | null
          checklist_json: any
          signature_path: string | null
          recipient_emails: string[]
          related_inspection_id: string | null
        }
        Insert: {
          id?: string
          asset_id: string
          workflow_name: string
          location: string
          type: 'checkout' | 'return' | 'update'
          status?: 'open' | 'closed'
          created_at?: string
          closed_at?: string | null
          checklist_json?: any
          signature_path?: string | null
          recipient_emails?: string[]
          related_inspection_id?: string | null
        }
        Update: {
          id?: string
          asset_id?: string
          workflow_name?: string
          location?: string
          type?: 'checkout' | 'return' | 'update'
          status?: 'open' | 'closed'
          created_at?: string
          closed_at?: string | null
          checklist_json?: any
          signature_path?: string | null
          recipient_emails?: string[]
          related_inspection_id?: string | null
        }
      }
      media: {
        Row: {
          id: string
          inspection_id: string
          file_path: string
          media_type: 'photo' | 'video'
          tag_label: string | null
          tag_timestamp: string | null
          taken_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          file_path: string
          media_type: 'photo' | 'video'
          tag_label?: string | null
          tag_timestamp?: string | null
          taken_at?: string
        }
        Update: {
          id?: string
          inspection_id?: string
          file_path?: string
          media_type?: 'photo' | 'video'
          tag_label?: string | null
          tag_timestamp?: string | null
          taken_at?: string
        }
      }
    }
  }
}
