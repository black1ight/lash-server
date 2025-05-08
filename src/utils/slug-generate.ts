import { slugify } from 'transliteration'
const customMap = {
	й: 'j',
	и: 'y',
	х: 'kh',
	ц: 'ts',
	ч: 'ch',
	ш: 'sh',
	щ: 'sch',
	є: 'ye',
	ї: 'yi',
	ю: 'yu',
	я: 'ya'
}
export const slugGenerate = (str: string) => {
	return slugify(str, { replace: customMap })
	// return str.split(' ').join('-').toLowerCase();
}
