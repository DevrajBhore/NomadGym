import { useState, useEffect, useMemo } from "react"
import "../../styles/Explore.css"
import { MapPin, ArrowBigRight } from "lucide-react"

// Mock React Router for preview
const Link = ({ to, children, className, onClick }) => (
  <a
    href={to}
    className={className}
    onClick={(e) => {
      e.preventDefault()
      onClick?.()
    }}
  >
    {children}
  </a>
)

const useLocation = () => ({
  search: "?search=",
})

const Explore = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const initialQuery = params.get("search") || ""

  const [cities, setCities] = useState([])
  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState(initialQuery)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mockCities = [
          {
            _id: "mumbai",
            name: "Mumbai",
            description: "Financial capital with premium gyms",
            totalGyms: 25,
            popular: true,
          },
          {
            _id: "delhi",
            name: "Delhi",
            description: "Capital city with diverse fitness options",
            totalGyms: 18,
            popular: true,
          },
          {
            _id: "bangalore",
            name: "Bangalore",
            description: "Tech hub with modern fitness centers",
            totalGyms: 22,
            popular: false,
          },
          {
            _id: "pune",
            name: "Pune",
            description: "Educational city with student-friendly gyms",
            totalGyms: 15,
            popular: false,
          },
          {
            _id: "hyderabad",
            name: "Hyderabad",
            description: "Growing city with expanding gym network",
            totalGyms: 12,
            popular: false,
          },
          {
            _id: "chennai",
            name: "Chennai",
            description: "Cultural capital with traditional and modern gyms",
            totalGyms: 16,
            popular: false,
          },
        ]

        const mockGyms = [
          {
            _id: "gym1",
            name: "FitZone Premium",
            description: "State-of-the-art equipment with personal training",
            city: "Mumbai",
            imageUrls: ["/modern-gym-interior.png"],
          },
          {
            _id: "gym2",
            name: "PowerHouse Fitness",
            description: "Strength training focused gym with expert trainers",
            city: "Delhi",
            imageUrls: ["/strength-training-gym.png"],
          },
          {
            _id: "gym3",
            name: "Wellness Hub",
            description: "Holistic fitness approach with yoga and cardio",
            city: "Bangalore",
            imageUrls: ["/wellness-fitness-center.png"],
          },
        ]

        setCities(mockCities)
        setGyms(mockGyms)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load gyms/cities. Try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Keep searchTerm in sync with the URL
  useEffect(() => {
    const newQuery = new URLSearchParams(location.search).get("search") || ""
    setSearchTerm(newQuery)
  }, [location.search])

  const filteredCities = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return cities.filter(
      (c) => (c?._id || "").toLowerCase().includes(term) || (c?.name || "").toLowerCase().includes(term),
    )
  }, [searchTerm, cities])

  const filteredGyms = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return gyms.filter(
      (g) =>
        (g?.name || "").toLowerCase().includes(term) ||
        (g?.description || "").toLowerCase().includes(term) ||
        (g?.city || "").toLowerCase().includes(term),
    )
  }, [searchTerm, gyms])

  const stats = useMemo(() => {
    const cityCount = cities.length
    const totalGyms = cities.reduce((sum, c) => sum + (Number(c?.totalGyms) || 0), 0)
    return [
      { number: String(cityCount), label: cityCount === 1 ? "City" : "Cities" },
      {
        number: String(totalGyms),
        label: totalGyms === 1 ? "Partner Gym" : "Partner Gyms",
      },
      { number: "24/7", label: "Support" },
    ]
  }, [cities])

  if (loading) return <Loader />
  if (error) return <div className="error-message-center">{error}</div>

  const handleCityClick = (city) => console.log(`Clicked on ${city?.name}`)
  const clearSearch = () => setSearchTerm("")

  return (
    <section className="cities-page">
      {/* Hero Section */}
      <div className="cities-hero">
        <div className="container">
          <h1 className="cities-title">Find Your City</h1>
          <p className="cities-subtitle">
            Discover NomadGym locations across India. Find the perfect fitness solution in your city.
          </p>

          <div className="search-section">
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search cities or gyms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <div className="search-icon">
                  <i className="ri-search-line">🔍</i>
                </div>
                {!!searchTerm && (
                  <button className="clear-search" onClick={clearSearch}>
                    ✕
                  </button>
                )}
              </div>
              <div className="search-results-count">
                {filteredCities.length} {filteredCities.length === 1 ? "city" : "cities"} &nbsp;•&nbsp;
                {filteredGyms.length} {filteredGyms.length === 1 ? "gym" : "gyms"} found
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="cities-stats container">
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div className="stat-card" key={idx}>
                <h3>{stat.number}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="cities-grid container">
        {filteredCities.length > 0 ? (
          filteredCities.map((city) => {
            const id = city?._id || city?.id
            const name = city?.name || city?._id || "Unknown City"
            const description = city?.description || "Explore gyms available in this city."
            const totalGyms = Number(city?.totalGyms) || 0
            const popular = Boolean(city?.popular)

            return (
              <Link
                to={`/gyms/${id}`}
                key={id}
                className={`city-card ${popular ? "popular" : ""}`}
                onClick={() => handleCityClick(city)}
              >
                {popular && <div className="popular-badge">Popular</div>}
                <div className="city-image">
                  <div className="city-overlay">
                    <h3 className="city-name">{name}</h3>
                  </div>
                </div>
                <div className="city-info">
                  <p>{description}</p>
                  <div className="city-stats">
                    <div className="city-stat">
                      <span className="stat-number">{totalGyms}</span>
                      <span className="stat-label">{totalGyms === 1 ? "Partner Gym" : "Partner Gyms"}</span>
                    </div>
                  </div>
                  <button className="btn city-btn">
                    <span>Explore {name}</span>
                    <span className="arrow">
                      <ArrowBigRight size={24} />
                    </span>
                  </button>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="no-results container">
            <div className="no-results-content">
              <h3>No cities found</h3>
              <p>Try adjusting your search terms</p>
              <button className="btn" onClick={clearSearch}>
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Matching Gyms Grid */}
      {filteredGyms.length > 0 && (
        <section className="matching-gyms-section">
          <div className="container">
            <h2 className="section-title">Matching Gyms</h2>
            <div className="gyms-list">
              {filteredGyms.map((gym) => (
                <Link to={`/gym/${gym._id}`} key={gym._id} className="gym-card">
                  <div className="gym-card-image-wrapper">
                    <img
                      src={
                        Array.isArray(gym.imageUrls) && gym.imageUrls.length > 0
                          ? gym.imageUrls[0]
                          : "/placeholder.svg?height=200&width=300&query=gym equipment"
                      }
                      alt={gym.name}
                      className="gym-card-image"
                    />
                  </div>
                  <div className="gym-card-content">
                    <h3 className="gym-name">{gym.name}</h3>
                    <h4>Description</h4>
                    <h5 className="gym-description">{gym.description?.slice(0, 100) || "No description provided."}</h5>
                    <p className="gym-city">
                      <MapPin size={16} /> {gym.city}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="cities-cta container">
        <div className="cta-content">
          <h2>Don't See Your City?</h2>
          <p>We're expanding rapidly! Let us know where you'd like to see NomadGym next.</p>
          <Link to="/contactus" className="btn cta-btn">
            Request Your City
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Explore
