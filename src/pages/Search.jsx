import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, MapPin, Star, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { getAllCategories, getServicesForCategory, getAllServices } from "../components/servicesData";

export default function Search() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
        try {
            await User.me(); 
            loadUsers();
        } catch (error) {
            console.error("Authentication failed or user not logged in:", error);
            window.location.href = createPageUrl('Home');
        }
    };
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, locationFilter, categoryFilter, serviceFilter, ratingFilter, availabilityFilter, minAge, maxAge]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      const allUsers = await User.list();
      
      // Filter out current user
      const otherUsers = allUsers.filter(user => user.id !== currentUser.id);
      setUsers(otherUsers);
      
    } catch (error) {
      console.error("Error loading users:", error);
    }
    setIsLoading(false);
  };

  const filterUsers = () => {
    let filtered = users;

    // Search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.services_offered?.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        user.services_wanted?.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        user.interests?.some(interest => 
          interest.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Location filter
    if (locationFilter !== "all") {
        const getRegion = (location) => {
            const north = ["חיפה", "קריות", "נהריה", "עכו", "צפת", "טבריה", "כרמיאל", "גולן"];
            const south = ["באר שבע", "אשדוד", "אשקלון", "אילת", "דימונה", "נתיבות", "שדרות"];
            if (north.some(city => location?.includes(city))) return "צפון";
            if (south.some(city => location?.includes(city))) return "דרום";
            return "מרכז";
        };
        filtered = filtered.filter(user => getRegion(user.location) === locationFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      const categoryServices = getServicesForCategory(categoryFilter);
      filtered = filtered.filter(user => 
        user.services_offered?.some(service => categoryServices.includes(service)) ||
        user.services_wanted?.some(service => categoryServices.includes(service))
      );
    }

    // Service filter
    if (serviceFilter !== "all") {
      filtered = filtered.filter(user => 
        user.services_offered?.includes(serviceFilter) ||
        user.services_wanted?.includes(serviceFilter)
      );
    }

    // Rating filter
    if (ratingFilter !== "all") {
        filtered = filtered.filter(user => (user.rating || 0) >= parseInt(ratingFilter));
    }

    // Availability filter
    if (availabilityFilter !== "all") {
        filtered = filtered.filter(user => Array.isArray(user.availability) && user.availability.includes(availabilityFilter));
    }

    // Age range filter
    if (minAge !== "") {
      filtered = filtered.filter(user => user.age && user.age >= parseInt(minAge));
    }
    if (maxAge !== "") {
      filtered = filtered.filter(user => user.age && user.age <= parseInt(maxAge));
    }
    
    setFilteredUsers(filtered);
  };

  const getAvailableServices = () => {
    if (categoryFilter !== "all") {
      return getServicesForCategory(categoryFilter);
    }
    return getAllServices();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-center">
          <SearchIcon className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">חיפוש משתמשים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">חיפוש וסינון</h1>

        {/* Search and Filters */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חפש לפי שם, שירותים, תחומי עניין..."
                  className="pr-10"
                />
              </div>

              {/* Filter Toggle */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  פילטרים {showFilters ? "▲" : "▼"}
                </Button>
                <p className="text-sm text-gray-600">
                  נמצאו {filteredUsers.length} משתמשים
                </p>
              </div>

              {/* Filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2">אזור גיאוגרפי</label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger><SelectValue placeholder="כל האזורים" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל הארץ</SelectItem>
                        <SelectItem value="צפון">צפון</SelectItem>
                        <SelectItem value="מרכז">מרכז</SelectItem>
                        <SelectItem value="דרום">דרום</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">קטגוריה</label>
                    <Select value={categoryFilter} onValueChange={(value) => {
                      setCategoryFilter(value);
                      setServiceFilter("all"); // Reset service filter when category changes
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="כל הקטגוריות" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל הקטגוריות</SelectItem>
                        {getAllCategories().map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">שירות ספציפי</label>
                    <Select value={serviceFilter} onValueChange={setServiceFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="כל השירותים" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל השירותים</SelectItem>
                        {getAvailableServices().slice(0, 30).map(service => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">דירוג מינימלי</label>
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger><SelectValue placeholder="כל הדירוגים" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל הדירוגים</SelectItem>
                        <SelectItem value="4">4 כוכבים ומעלה</SelectItem>
                        <SelectItem value="3">3 כוכבים ומעלה</SelectItem>
                        <SelectItem value="2">2 כוכבים ומעלה</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">זמינות</label>
                    <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                      <SelectTrigger><SelectValue placeholder="כל הזמינויות" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל הזמינויות</SelectItem>
                        <SelectItem value="בקרים">בקרים</SelectItem>
                        <SelectItem value="צהריים">צהריים</SelectItem>
                        <SelectItem value="ערבים">ערבים</SelectItem>
                        <SelectItem value='סופ"ש'>סופ"ש</SelectItem>
                        <SelectItem value="כל השבוע">כל השבוע</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="glass-card hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-200 to-teal-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {user.profile_image ? (
                        <img 
                          src={user.profile_image} 
                          alt={user.full_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-600">
                          {user.full_name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{user.full_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {user.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {user.location}
                              </div>
                            )}
                            {user.age && <span>• גיל {user.age}</span>}
                          </div>
                        </div>
                        
                        {user.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-yellow-500" />
                            <span className="text-sm font-medium">{user.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {user.bio && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{user.bio}</p>
                      )}

                      {/* Services Offered */}
                      {user.services_offered && user.services_offered.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">מציע:</p>
                          <div className="flex flex-wrap gap-1">
                            {user.services_offered.slice(0, 2).map((service, index) => (
                              <Badge key={index} className="bg-orange-100 text-orange-700 text-xs">
                                {service}
                              </Badge>
                            ))}
                            {user.services_offered.length > 2 && (
                              <Badge className="bg-gray-100 text-gray-600 text-xs">
                                +{user.services_offered.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Services Wanted */}
                      {user.services_wanted && user.services_wanted.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">מחפש:</p>
                          <div className="flex flex-wrap gap-1">
                            {user.services_wanted.slice(0, 2).map((service, index) => (
                              <Badge key={index} className="bg-teal-100 text-teal-700 text-xs">
                                {service}
                              </Badge>
                            ))}
                            {user.services_wanted.length > 2 && (
                              <Badge className="bg-gray-100 text-gray-600 text-xs">
                                +{user.services_wanted.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <Card className="glass-card p-8 text-center">
            <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">לא נמצאו תוצאות</h3>
            <p className="text-gray-600">
              נסו לשנות את מילות החיפוש או הפילטרים
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}