import { useEffect, useState } from 'react';
import { teamService } from '../services/teamService';
import { TeamMember } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useToast } from '../hooks/use-toast';
import { Mail, Briefcase } from 'lucide-react';

export default function Team() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedMemberId, setExpandedMemberId] = useState<number | null>(null);
  const { toast } = useToast();

  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    email: '',
    avatar: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await teamService.getAllTeam();
    setTeam(data);
    setLoading(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.role) {
      toast({ title: "Erreur", description: "Le nom et le rôle sont requis", variant: "destructive" });
      return;
    }

    const success = await teamService.addTeamMember(newMember);
    if (success) {
      toast({ title: "Succès", description: "Membre ajouté !" });
      setShowForm(false);
      setNewMember({
        name: '',
        role: '',
        email: '',
        avatar: ''
      });
      loadData();
    } else {
      toast({ title: "Erreur", description: "Impossible d'ajouter le membre", variant: "destructive" });
    }
  };

  const handleUpdateMember = async (memberId: number, updates: Partial<TeamMember>) => {
    const success = await teamService.updateTeamMember(memberId, updates);
    if (success) {
      toast({ title: "Succès", description: "Membre mis à jour" });
      loadData();
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      const success = await teamService.deleteTeamMember(memberId);
      if (success) {
        toast({ title: "Succès", description: "Membre supprimé" });
        setExpandedMemberId(null);
        loadData();
      }
    }
  };

  const filteredTeam = searchQuery
    ? team.filter(m =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : team;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-orange-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">👥 Gestion de l'Équipe</h1>
          <p className="text-muted-foreground mt-2">Gérez les membres de votre équipe</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? '❌ Annuler' : '➕ Nouveau membre'}
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Rechercher un membre..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleAddMember} className="space-y-4">
              <h3 className="text-lg font-semibold">➕ Nouveau membre</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom *</label>
                  <Input
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Ex: Marie Dupont"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rôle *</label>
                  <Input
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    placeholder="Ex: Product Manager"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="Ex: marie@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Avatar URL</label>
                  <Input
                    value={newMember.avatar}
                    onChange={(e) => setNewMember({ ...newMember, avatar: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">✅ Ajouter le membre</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeam.map((member) => {
          const isExpanded = expandedMemberId === member.id;

          return (
            <Card
              key={member.id}
              className={`hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] ${isExpanded ? 'ring-2 ring-primary shadow-lg' : ''}`}
              onClick={() => !isExpanded && setExpandedMemberId(member.id)}
            >
              <CardContent className="pt-6 space-y-4">
                {/* Avatar */}
                <div className="flex justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className={`${getAvatarColor(member.name)} text-white text-xl font-bold`}>
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Info */}
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{member.role}</span>
                  </div>
                  {member.email && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </div>

                {/* Edit Panel */}
                {isExpanded && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold text-sm">Modifier le membre</h4>

                    <div className="space-y-2">
                      <Input
                        placeholder="Nom"
                        defaultValue={member.name}
                        onBlur={(e) => {
                          if (e.target.value !== member.name) {
                            handleUpdateMember(member.id, { name: e.target.value });
                          }
                        }}
                      />

                      <Input
                        placeholder="Rôle"
                        defaultValue={member.role}
                        onBlur={(e) => {
                          if (e.target.value !== member.role) {
                            handleUpdateMember(member.id, { role: e.target.value });
                          }
                        }}
                      />

                      <Input
                        type="email"
                        placeholder="Email"
                        defaultValue={member.email || ''}
                        onBlur={(e) => {
                          if (e.target.value !== member.email) {
                            handleUpdateMember(member.id, { email: e.target.value });
                          }
                        }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedMemberId(null);
                        }}
                        className="flex-1"
                      >
                        Fermer
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMember(member.id);
                        }}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTeam.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun membre trouvé
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {team.length > 0 && (
        <Card>
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">{team.length}</div>
                <div className="text-sm text-muted-foreground">Membres totaux</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {new Set(team.map(m => m.role)).size}
                </div>
                <div className="text-sm text-muted-foreground">Rôles différents</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {team.filter(m => m.email).length}
                </div>
                <div className="text-sm text-muted-foreground">Avec email</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
