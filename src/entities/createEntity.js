import { supabase } from '@/lib/supabase';

/**
 * Generic entity factory that mirrors the BASE44 SDK API.
 * Usage: const MyEntity = createEntity('my_table');
 */
export function createEntity(tableName) {
  return {
    /**
     * Get all records, optionally ordered and limited.
     * orderBy: '-created_date' (desc) or 'created_date' (asc)
     */
    async list(orderBy = '-created_date', limit = 1000) {
      let q = supabase.from(tableName).select('*');
      q = applyOrder(q, orderBy);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },

    /**
     * Filter records by conditions object.
     * Supports: { field: value, field2: value2 }
     * Supports: { $or: [{ field: value }, { field2: value2 }] }
     */
    async filter(conditions = {}, orderBy = '-created_date', limit = 1000) {
      let q = supabase.from(tableName).select('*');
      q = applyConditions(q, conditions);
      q = applyOrder(q, orderBy);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },

    /** Get a single record by id */
    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    /** Create a new record */
    async create(payload) {
      const { data, error } = await supabase
        .from(tableName)
        .insert({ ...payload, created_date: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /** Update a record by id */
    async update(id, payload) {
      const { data, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /** Delete a record by id */
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    /**
     * Subscribe to realtime changes.
     * Callback receives: { type: 'INSERT'|'UPDATE'|'DELETE', data: record, id: record.id }
     * Returns unsubscribe function.
     */
    subscribe(callback) {
      const channel = supabase
        .channel(`${tableName}_changes_${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload) => {
            callback({
              type: payload.eventType === 'INSERT' ? 'create'
                  : payload.eventType === 'UPDATE' ? 'update'
                  : 'delete',
              data: payload.new ?? payload.old,
              id: (payload.new ?? payload.old)?.id,
            });
          }
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    },
  };
}

// ── Helpers ──────────────────────────────────────────────────

function applyOrder(query, orderBy) {
  if (!orderBy) return query;
  const desc = orderBy.startsWith('-');
  const col  = desc ? orderBy.slice(1) : orderBy;
  return query.order(col, { ascending: !desc });
}

function applyConditions(query, conditions) {
  if (!conditions || typeof conditions !== 'object') return query;

  // Handle $or: [{ field: val }, { field2: val2 }]
  if (conditions.$or && Array.isArray(conditions.$or)) {
    const orParts = conditions.$or
      .map(c => Object.entries(c).map(([k, v]) => `${k}.eq.${v}`).join(','))
      .join(',');
    return query.or(orParts);
  }

  // Regular key-value conditions
  for (const [key, value] of Object.entries(conditions)) {
    if (key.startsWith('$')) continue;
    if (Array.isArray(value)) {
      query = query.in(key, value);
    } else if (value === null) {
      query = query.is(key, null);
    } else {
      query = query.eq(key, value);
    }
  }
  return query;
}
