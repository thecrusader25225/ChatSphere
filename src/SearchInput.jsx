import './SearchInput.css'
export default function SearchInput({setUsername}){
    return  <div className="form">
    <input
      className="input w-full"
      placeholder="Search by username"
      required=""
      type="text"
      onChange={e=>setUsername(e.target.value)}
    />
    <span className="input-border" />
  </div>

  }