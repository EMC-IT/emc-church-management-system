'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  UsersRound, 
  Plus, 
  Search, 
  Users, 
  Calendar, 
  MapPin,
  TrendingUp,
  Eye,
  Edit,
  Download,
  Loader2,
  FolderTree
} from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupStats } from '@/lib/types/groups';
import { toast } from 'sonner';

const categories = ['All', 'Ministry', 'Fellowship', 'Study', 'Prayer', 'Outreach'];

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    loadGroups();
    loadStats();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await groupsService.getGroups({
        search: searchTerm || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        limit: 50
      });
      
      if (response.success && response.data) {
        setGroups(response.data);
      } else {
        toast.error(response.message || 'Failed to load groups');
      }
    } catch {
      toast.error('Failed to load groups');
    }
  };

  const loadStats = async () => {
    try {
      const response = await groupsService.getGroupStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load group stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadGroups();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryFilter]);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.leader.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || group.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleCreateGroup = () => {
    router.push('/dashboard/groups/add');
  };

  const handleManageCategories = () => {
    router.push('/dashboard/groups/categories');
  };

  const handleViewGroup = (groupId: string) => {
    router.push(`/dashboard/groups/${groupId}`);
  };

  const handleEditGroup = (groupId: string) => {
    router.push(`/dashboard/groups/${groupId}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Groups</h1>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleManageCategories}>
            <FolderTree className="mr-1.5 h-4 w-4" />
            Categories
          </Button>
          <Button onClick={handleCreateGroup} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Groups"
          value={stats?.totalGroups || 0}
          icon={UsersRound}
        />
        <StatCard
          title="Total Members"
          value={stats?.totalMembers || 0}
          icon={Users}
        />
        <StatCard
          title="Avg Engagement"
          value={`${stats?.averageEngagement || 0}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Active Groups"
          value={stats?.activeGroups || 0}
          icon={UsersRound}
        />
      </div>

      {/* Groups Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Directory ({filteredGroups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Groups Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold">{group.name}</CardTitle>
                      <Badge variant="neutral" size="sm">{group.category}</Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewGroup(group.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditGroup(group.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground line-clamp-2">{group.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium text-foreground">{group.members} / {group.maxMembers}</span>
                    </div>
                    <Progress value={(group.members / group.maxMembers) * 100} className="h-1.5" />
                    
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="font-medium text-foreground">{group.engagement}%</span>
                    </div>
                    <Progress value={group.engagement} className="h-1.5" />
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{group.meetingSchedule}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{group.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                          {group.leader.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">{group.leader.name}</span>
                    </div>
                    
                    <StatusBadge status={group.status} size="sm" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}