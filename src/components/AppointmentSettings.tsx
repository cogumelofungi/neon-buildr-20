import { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, Plus, Trash2, CheckCircle, XCircle, Edit2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppointments, Appointment, NewAppointment } from '@/hooks/useAppointments';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentSettingsProps {
  appId: string;
}

const statusLabels: Record<Appointment['status'], string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
};

const statusColors: Record<Appointment['status'], string> = {
  scheduled: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  confirmed: 'bg-green-500/20 text-green-700 dark:text-green-400',
  cancelled: 'bg-red-500/20 text-red-700 dark:text-red-400',
  completed: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
};

const AppointmentSettings = ({ appId }: AppointmentSettingsProps) => {
  const {
    appointments,
    upcomingAppointments,
    isLoading,
    createAppointment,
    updateStatus,
    deleteAppointment,
  } = useAppointments(appId);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<NewAppointment>({
    app_id: appId,
    client_name: '',
    client_email: '',
    client_phone: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 60,
    service_type: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.appointment_date || !formData.appointment_time) {
      return;
    }
    
    const result = await createAppointment(formData);
    if (result) {
      setFormData({
        app_id: appId,
        client_name: '',
        client_email: '',
        client_phone: '',
        appointment_date: '',
        appointment_time: '',
        duration_minutes: 60,
        service_type: '',
        notes: '',
      });
      setShowForm(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isPast(date) && !isToday(date)) {
      return 'Passado';
    }
    return formatDate(dateStr);
  };

  return (
    <div className="space-y-4">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Agenda de Consultas</h3>
        </div>
        <Button 
          size="sm" 
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'outline' : 'default'}
        >
          {showForm ? 'Cancelar' : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Nova Consulta
            </>
          )}
        </Button>
      </div>

      {/* Formulário de nova consulta */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Agendar Nova Consulta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="client_name" className="text-xs">Nome do Cliente *</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="client_name"
                      placeholder="Nome completo"
                      className="pl-8 h-9"
                      value={formData.client_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="client_email" className="text-xs">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="client_email"
                      type="email"
                      placeholder="email@exemplo.com"
                      className="pl-8 h-9"
                      value={formData.client_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="client_phone" className="text-xs">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="client_phone"
                      placeholder="(00) 00000-0000"
                      className="pl-8 h-9"
                      value={formData.client_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="appointment_date" className="text-xs">Data *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="appointment_date"
                      type="date"
                      className="pl-8 h-9"
                      value={formData.appointment_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="appointment_time" className="text-xs">Horário *</Label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="appointment_time"
                      type="time"
                      className="pl-8 h-9"
                      value={formData.appointment_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="duration" className="text-xs">Duração</Label>
                  <Select
                    value={String(formData.duration_minutes)}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, duration_minutes: Number(value) }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1h 30min</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="service_type" className="text-xs">Tipo de Atendimento</Label>
                  <Input
                    id="service_type"
                    placeholder="Ex: Consulta, Retorno..."
                    className="h-9"
                    value={formData.service_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="notes" className="text-xs">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Anotações sobre a consulta..."
                    className="min-h-[60px] resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Agendar Consulta
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3">
          <div className="text-2xl font-bold text-primary">{upcomingAppointments.length}</div>
          <div className="text-xs text-muted-foreground">Próximas</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-yellow-600">{appointments.filter(a => a.status === 'scheduled').length}</div>
          <div className="text-xs text-muted-foreground">Agendadas</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-green-600">{appointments.filter(a => a.status === 'confirmed').length}</div>
          <div className="text-xs text-muted-foreground">Confirmadas</div>
        </Card>
      </div>

      {/* Lista de agendamentos */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Próximos Agendamentos</h4>
        
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando...
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <Card className="p-6 text-center">
            <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground text-sm">
              Nenhuma consulta agendada
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Clique em "Nova Consulta" para agendar
            </p>
          </Card>
        ) : (
          <ScrollArea className="h-[300px] pr-2">
            <div className="space-y-2">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{appointment.client_name}</span>
                        <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[appointment.status]}`}>
                          {statusLabels[appointment.status]}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {getDateLabel(appointment.appointment_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(appointment.appointment_time)}
                        </span>
                        {appointment.duration_minutes && (
                          <span>({appointment.duration_minutes}min)</span>
                        )}
                      </div>
                      
                      {appointment.service_type && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {appointment.service_type}
                        </p>
                      )}
                      
                      {(appointment.client_phone || appointment.client_email) && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {appointment.client_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {appointment.client_phone}
                            </span>
                          )}
                          {appointment.client_email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3" />
                              {appointment.client_email}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {appointment.status === 'scheduled' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100"
                          onClick={() => updateStatus(appointment.id, 'confirmed')}
                          title="Confirmar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                            onClick={() => updateStatus(appointment.id, 'completed')}
                            title="Marcar como concluído"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-100"
                            onClick={() => updateStatus(appointment.id, 'cancelled')}
                            title="Cancelar"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteAppointment(appointment.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                      {appointment.notes}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default AppointmentSettings;
