
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { serviceCategories, searchServices } from './servicesData';

export default function ServiceSelector({ 
  selectedServices = [], 
  onServicesChange, 
  title = "בחרו שירותים",
  placeholder = "חפשו שירות...",
  maxServices = 10 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(Object.keys(serviceCategories)[0]);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      const results = searchServices(term);
      setSearchResults(results.slice(0, 20)); // מגביל ל-20 תוצאות
    } else {
      setSearchResults([]);
    }
  };

  const addService = (service) => {
    if (!selectedServices.includes(service) && selectedServices.length < maxServices) {
      const newServices = [...selectedServices, service];
      onServicesChange(newServices);
    }
  };

  const removeService = (service) => {
    const newServices = selectedServices.filter(s => s !== service);
    onServicesChange(newServices);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="text-sm text-gray-600">
          נבחרו {selectedServices.length} מתוך {maxServices} שירותים
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Services */}
        {selectedServices.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">שירותים שנבחרו:</h4>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {selectedServices.map((service) => (
                  <motion.div
                    key={service}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 flex items-center gap-1 pr-2">
                      {service}
                      <button
                        onClick={() => removeService(service)}
                        className="hover:bg-orange-200 rounded-full p-0.5 mr-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="pr-10"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">תוצאות חיפוש:</h4>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.category}-${result.service}`}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{result.service}</span>
                    <span className="text-xs text-gray-500 mr-2">({result.category})</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addService(result.service)}
                    disabled={selectedServices.includes(result.service) || selectedServices.length >= maxServices}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {!searchTerm && (
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="grid grid-cols-3 lg:grid-cols-4 h-auto gap-1 bg-gray-100 p-1">
              {Object.keys(serviceCategories).slice(0, 8).map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-xs p-2 h-auto text-center leading-tight"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Show remaining categories in a dropdown or expandable section */}
            {Object.keys(serviceCategories).length > 8 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                  עוד קטגוריות ({Object.keys(serviceCategories).length - 8})
                </summary>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                  {Object.keys(serviceCategories).slice(8).map((category) => (
                    <Button
                      key={category}
                      variant={activeCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveCategory(category)}
                      className="text-xs p-2 h-auto"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </details>
            )}

            {Object.entries(serviceCategories).map(([category, services]) => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {services.map((service) => (
                    <Button
                      key={service}
                      variant="outline"
                      size="sm"
                      onClick={() => addService(service)}
                      disabled={selectedServices.includes(service) || selectedServices.length >= maxServices}
                      className="justify-start text-right h-auto p-3"
                    >
                      <span className="flex-1">{service}</span>
                      {selectedServices.includes(service) ? (
                        <span className="text-green-500 mr-2">✓</span>
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
