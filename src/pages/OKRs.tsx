import { useEffect, useState } from 'react';
import { okrService } from '../services/okrService';
import { OKR, KeyResult } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useToast } from '../hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

export default function OKRs() {
  const [okrs, setOKRs] = useState<OKR[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedOKRId, setExpandedOKRId] = useState<number | null>(null);
  const { toast } = useToast();

  const [newOKR, setNewOKR] = useState({
    objective: '',
    status: 'on-track' as OKR['status'],
    quarter: '',
    key_results: [] as KeyResult[]
  });

  const [newKR, setNewKR] = useState({ description: '', progress: 0, target: 100 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await okrService.getAllOKRs();
    setOKRs(data);
    setLoading(false);
  };

  const handleAddKeyResult = () => {
    if (!newKR.description) {
      toast({ title: "Erreur", description: "La description du KR est requise", variant: "destructive" });
      return;
    }
    setNewOKR({
      ...newOKR,
      key_results: [...newOKR.key_results, { ...newKR }]
    });
    setNewKR({ description: '', progress: 0, target: 100 });
  };

  const handleRemoveKeyResult = (index: number) => {
    setNewOKR({
      ...newOKR,
      key_results: newOKR.key_results.filter((_, i) => i !== index)
    });
  };

  const handleAddOKR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOKR.objective) {
      toast({ title: "Erreur", description: "L'objectif est requis", variant: "destructive" });
      return;
    }

    if (newOKR.key_results.length === 0) {
      toast({ title: "Erreur", description: "Au moins un Key Result est requis", variant: "destructive" });
      return;
    }

    const success = await okrService.addOKR(newOKR);
    if (success) {
      toast({ title: "Succès", description: "OKR créé !" });
      setShowForm(false);
      setNewOKR({
        objective: '',
        status: 'on-track',
        quarter: '',
        key_results: []
      });
      loadData();
    } else {
      toast({ title: "Erreur", description: "Impossible de créer l'OKR", variant: "destructive" });
    }
  };

  const handleUpdateOKR = async (okrId: number, updates: Partial<OKR>) => {
    const success = await okrService.updateOKR(okrId, updates);
    if (success) {
      toast({ title: "Succès", description: "OKR mis à jour" });
      loadData();
    }
  };

  const handleDeleteOKR = async (okrId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet OKR ?')) {
      const success = await okrService.deleteOKR(okrId);
      if (success) {
        toast({ title: "Succès", description: "OKR supprimé" });
        setExpandedOKRId(null);
        loadData();
      }
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'on-track': '🟢 On Track',
      'at-risk': '🟡 At Risk',
      'off-track': '🔴 Off Track'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'on-track': 'default',
      'at-risk': 'default',
      'off-track': 'destructive'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const calculateOverallProgress = (keyResults: KeyResult[] | string): number => {
    if (typeof keyResults === 'string') return 0;
    if (keyResults.length === 0) return 0;

    const totalProgress = keyResults.reduce((sum, kr) => {
      const percentage = (kr.progress / kr.target) * 100;
      return sum + percentage;
    }, 0);

    return Math.round(totalProgress / keyResults.length);
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🎯 OKRs - Objectifs & Résultats Clés</h1>
          <p className="text-muted-foreground mt-2">Définissez et suivez vos objectifs stratégiques</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? '❌ Annuler' : '➕ Nouvel OKR'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleAddOKR} className="space-y-4">
              <h3 className="text-lg font-semibold">➕ Nouvel OKR</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Objectif (Objective) *</label>
                  <Input
                    value={newOKR.objective}
                    onChange={(e) => setNewOKR({ ...newOKR, objective: e.target.value })}
                    placeholder="Ex: Augmenter l'engagement utilisateur"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Statut</label>
                  <Select
                    value={newOKR.status}
                    onValueChange={(value) => setNewOKR({ ...newOKR, status: value as OKR['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-track">🟢 On Track</SelectItem>
                      <SelectItem value="at-risk">🟡 At Risk</SelectItem>
                      <SelectItem value="off-track">🔴 Off Track</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trimestre</label>
                  <Input
                    value={newOKR.quarter}
                    onChange={(e) => setNewOKR({ ...newOKR, quarter: e.target.value })}
                    placeholder="Ex: Q1 2025"
                  />
                </div>
              </div>

              {/* Key Results */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">Key Results *</label>
                  <span className="text-sm text-muted-foreground">
                    {newOKR.key_results.length} KR{newOKR.key_results.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Existing KRs */}
                {newOKR.key_results.map((kr, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{kr.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Progression: {kr.progress}/{kr.target}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveKeyResult(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Add KR Form */}
                <div className="p-4 border rounded-md space-y-3">
                  <Input
                    placeholder="Description du Key Result"
                    value={newKR.description}
                    onChange={(e) => setNewKR({ ...newKR, description: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Progression actuelle"
                      value={newKR.progress}
                      onChange={(e) => setNewKR({ ...newKR, progress: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                      type="number"
                      placeholder="Cible"
                      value={newKR.target}
                      onChange={(e) => setNewKR({ ...newKR, target: parseInt(e.target.value) || 100 })}
                    />
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddKeyResult}>
                    <Plus className="h-4 w-4 mr-2" /> Ajouter ce KR
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">✅ Créer l'OKR</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* OKRs List */}
      <div className="space-y-4">
        {okrs.map((okr) => {
          const isExpanded = expandedOKRId === okr.id;
          const keyResults = Array.isArray(okr.key_results) ? okr.key_results : [];
          const overallProgress = calculateOverallProgress(okr.key_results);

          return (
            <Card
              key={okr.id}
              className={`hover:shadow-lg transition-all ${isExpanded ? 'ring-2 ring-primary' : ''}`}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedOKRId(isExpanded ? null : okr.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{okr.objective}</CardTitle>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(okr.status) as any}>
                        {getStatusLabel(okr.status)}
                      </Badge>
                      {okr.quarter && (
                        <span className="text-sm text-muted-foreground">
                          📅 {okr.quarter}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{overallProgress}%</div>
                    <div className="text-xs text-muted-foreground">Progression globale</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Key Results */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Key Results:</h4>
                  {keyResults.map((kr, index) => {
                    const krProgress = (kr.progress / kr.target) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{kr.description}</span>
                          <span className="font-medium">
                            {kr.progress}/{kr.target}
                          </span>
                        </div>
                        <Progress value={krProgress} />
                      </div>
                    );
                  })}
                </div>

                {/* Edit Panel */}
                {isExpanded && (
                  <div className="pt-4 mt-4 border-t space-y-3">
                    <h4 className="font-semibold text-sm">Modifier l'OKR</h4>

                    <Select
                      value={okr.status}
                      onValueChange={(value) => handleUpdateOKR(okr.id, { status: value as OKR['status'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on-track">🟢 On Track</SelectItem>
                        <SelectItem value="at-risk">🟡 At Risk</SelectItem>
                        <SelectItem value="off-track">🔴 Off Track</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedOKRId(null)}
                        className="flex-1"
                      >
                        Fermer
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteOKR(okr.id)}
                      >
                        🗑️ Supprimer
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {okrs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun OKR trouvé. Créez votre premier objectif !
          </CardContent>
        </Card>
      )}
    </div>
  );
}
