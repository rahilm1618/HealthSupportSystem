
import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const Search = ({ onSearch, placeholder = "Search hospitals, doctors, specialties..." }: SearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md">
      <div className="relative flex-grow">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 h-12 rounded-l-md border-r-0"
        />
      </div>
      <Button 
        type="submit" 
        className="h-12 px-6 bg-health-primary text-white hover:bg-health-secondary rounded-l-none"
      >
        <SearchIcon className="h-5 w-5" />
        <span className="ml-2 hidden sm:inline">Search</span>
      </Button>
    </form>
  );
};

export default Search;
