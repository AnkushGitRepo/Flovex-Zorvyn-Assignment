import { useSelector, useDispatch } from 'react-redux';
import { selectRole, selectIsAdmin, setRole } from '../store/roleSlice';

export function useRole() {
  const dispatch = useDispatch();
  const role = useSelector(selectRole);
  const isAdmin = useSelector(selectIsAdmin);
  return { role, isAdmin, setRole: (r) => dispatch(setRole(r)) };
}
