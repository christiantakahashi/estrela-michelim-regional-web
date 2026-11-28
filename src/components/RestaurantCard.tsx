import type { RestaurantResult } from '../api/types'
import {
  Badge,
  Card,
  CardMatch,
  CardMeta,
  CardName,
  CardTags,
  CardTop,
  Rating,
} from './ui'


type RestaurantCardProps = {
  restaurant: RestaurantResult
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const priceLabel = '$'.repeat(Math.min(Math.max(restaurant.price_range, 1), 4))

  return (
    <Card>
      <CardTop>
        <CardName>
          <a href={`/restaurantes/${restaurant.id}`}>{restaurant.name}</a>
        </CardName>

        {restaurant.compatibility !== null && (
            
          <CardMatch value={`${restaurant.compatibility}%`} label="compatível" />
        )}
        </CardTop>

      <CardMeta>
        <span>
          {restaurant.neighborhood} • {restaurant.city}

        </span>

        <span>{priceLabel}</span>

        <Rating value={restaurant.average_rating} />

        {restaurant.is_new && <Badge variant="new">Novidade</Badge>}
      </CardMeta>

      {restaurant.matched_tags.length > 0 && (
        <CardTags>

          {restaurant.matched_tags.map((tag) => (

            <Badge key={tag} variant="match">
              {tag}

            </Badge>
          ))}

          </CardTags>
      )}
    </Card>
  )
}