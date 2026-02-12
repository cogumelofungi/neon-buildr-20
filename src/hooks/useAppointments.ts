import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  app_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  service_type?: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface NewAppointment {
  app_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes?: number;
  service_type?: string;
  notes?: string;
}

export const useAppointments = (appId?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchAppointments = useCallback(async () => {
    if (!appId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('app_id', appId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      
      setAppointments((data as Appointment[]) || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [appId, toast]);

  const createAppointment = async (appointment: NewAppointment) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();

      if (error) throw error;

      setAppointments(prev => [...prev, data as Appointment]);
      toast({
        title: 'Sucesso',
        description: 'Consulta agendada com sucesso!',
      });
      return data as Appointment;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível agendar a consulta.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAppointments(prev => 
        prev.map(apt => apt.id === id ? (data as Appointment) : apt)
      );
      toast({
        title: 'Sucesso',
        description: 'Agendamento atualizado!',
      });
      return data as Appointment;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o agendamento.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => prev.filter(apt => apt.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Agendamento removido!',
      });
      return true;
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o agendamento.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateStatus = async (id: string, status: Appointment['status']) => {
    return updateAppointment(id, { status });
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Agendamentos por status
  const scheduledAppointments = appointments.filter(a => a.status === 'scheduled');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');
  const upcomingAppointments = appointments.filter(a => 
    (a.status === 'scheduled' || a.status === 'confirmed') &&
    new Date(`${a.appointment_date}T${a.appointment_time}`) >= new Date()
  );

  return {
    appointments,
    scheduledAppointments,
    confirmedAppointments,
    upcomingAppointments,
    isLoading,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    updateStatus,
  };
};
